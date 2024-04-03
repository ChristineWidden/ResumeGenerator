const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { spawn } = require('child_process');

const multer = require('multer');
const upload = multer();

const app = express();
const port = 3000;

app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/generate-json', upload.none(), async (req, res) => {
    // console.log("RES")
    // console.log(res)
    console.log("REQ")
    console.log(req.body)
    // Read the JSON file
    let masterlistData = await readFileAsync("public/masterlist_data.json")
    // console.log(masterlistData)

    // continue here.........
    let resumeData = {}

    let schoolCourseDict = {}

    for (const key in req.body) {
        const val = req.body[key]

        if (Array.isArray(val)) {
            if (val[0] === "Other") {
                resumeData[key] = val[1]
            } else {
                resumeData[key] = val[0]
            }
        } else {
            let splitString = key.split('.')
            let name = splitString[0]
            let index = splitString.slice(-1)[0]

            // console.log(index)

            if (name !== 'courses' && name !== 'section_order') {
                if (!(resumeData.hasOwnProperty(name))) {
                    resumeData[name] = []
                }
                // console.log("Key: " + key)
                // console.log("Name: " + name)
                // console.log(masterlistData[name])
                resumeData[name].push(masterlistData[name][index])
            } else if (name === 'courses') {
                school = splitString[1]
                if (!schoolCourseDict.hasOwnProperty(school)) {
                    schoolCourseDict[school] = []
                }
                schoolCourseDict[school].push(parseInt(index))
            } else if (name === 'section_order') {
                resumeData[key] = JSON.parse(val)
            }
            // let lastIndex = key.lastIndexOf('_'); // Find the index of the last underscore
            // let name = key.substring(0, lastIndex); // Extract the substring before the last underscore
            // let index = parseInt(key.substring(lastIndex + 1))
        }
    }

    console.log("School Course Dict: ")
    console.log(schoolCourseDict)
    // for (const schoolID in schoolCourseDict) {
    //     const indexesToKeep = schoolCourseDict[schoolID];
    
    //     // Find the school object with the corresponding SchoolID
    //     const school = resumeData["schools"].find(school => school.schoolID === schoolID);
        
    //     if (school) {
    //         // Filter the courses array based on the indexes to keep
    //         school.courses = school.courses.filter((course, index) => indexesToKeep.includes(index));
    //     }
    // }

    console.log(resumeData["schools"])
    
    if (resumeData["schools"]) {
        resumeData["schools"].forEach(school => {
            console.log("SCHOOL!")
            console.log(school)
            console.log("_")
            const schoolID = school.schoolID
            
            if(schoolCourseDict.hasOwnProperty(schoolID)) {
                const indexesToKeep = schoolCourseDict[schoolID];
                // Filter the courses array based on the indexes to keep
                school.courses = school.courses.filter((course, index) => indexesToKeep.includes(index));
            } else {
                school.courses = []
                console.log(schoolID + school.courses)
            }
        });
    }
    
    // for (const school in resumeData["schools"]) {
    //     console.log("SCHOOL!")
    //     console.log(school)
    //     console.log("_")
    //     const schoolID = school.schoolID
        
    //     if(schoolCourseDict.hasOwnProperty(schoolID)) {
    //         const indexesToKeep = schoolCourseDict[schoolID];
    //         // Filter the courses array based on the indexes to keep
    //         school.courses = school.courses.filter((course, index) => indexesToKeep.includes(index));
    //     } else {
    //         school.courses = []
    //         console.log(schoolID + school.courses)
    //     }
    // }

    // console.log('XXXXXXXXXXXXXXXXXXX')
    // console.log(resumeData)
    // console.log('XXXXXXXXXXXXXXXXXXX')

    const outputDir = path.join(__dirname, 'output');
    const outputFilePath = path.join(outputDir, 'generated_resume_template.json');

    // Create the 'output' directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const jsonData = JSON.stringify(resumeData, null, 2);
    console.log(jsonData)
    fs.writeFileSync(outputFilePath, jsonData);


    // Execute the Python script
    const pythonProcess = spawn('python', ['pdfGenerator.py']);
    
    res_text = "JSON generated successfully and PDF generated"

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res_text = `${data}`
    });

    pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        res.send(res_text);
    });

});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


function readFileAsync(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading JSON file:', err);
                reject(err);
            } else {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    reject(error);
                }
            }
        });
    });
}