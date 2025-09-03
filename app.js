const fs = require('fs/promises')
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { spawn } = require('child_process');
const multer = require('multer');
const upload = multer();

const app = express();
const PORT = process.env.PORT || 3000;

// File paths
const MASTERLIST_PATH = path.join(__dirname, 'public', 'data/masterlist_data.json');
const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'generated_resume_template.json');

// Middleware setup
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handle resume generation requests
app.post('/generate-json', upload.none(), async (req, res) => {
    try {
        console.log('\n=== Incoming Resume Generation Request ===');

        // Read the JSON file
        const masterlistData = JSON.parse(await fs.readFile(MASTERLIST_PATH, { encoding: 'utf8' }));
        const resumeData = {}
        const schoolCourseDict = {}

        // Parse form input into structured JSON
        for (const key in req.body) {
            const val = req.body[key]

            if (Array.isArray(val)) {
                // Dropdown field with optional "Other" input
                resumeData[key] = val[0] === "Other" ? val[1] : val[0]
                console.log(`Field ${key}: ${resumeData[key]}`);
            } else {
                // Other data comes as checkboxes
                // in forms like skills.0 skills.1 etc.
                // so here we get the category (name) and the index
                const parts = key.split('.')
                const category_name = parts[0]
                const index = parseInt(parts[parts.length - 1])

                // courses and section order are formatted differently
                if (category_name !== 'courses' && category_name !== 'section_order') {
                    // If this category doesn't exist yet, make it
                    if (!(resumeData[category_name])) resumeData[category_name] = []
                    // Retrieve the item with the same index from the masterlist and add it
                    resumeData[category_name].push(masterlistData[category_name][index])

                } else if (category_name === 'courses') {
                    // courses has nested checkboxes so needs special treatment
                    const degree = parts[1]
                    // If this degree doesn't exist yet, put the school in the school dict
                    if (!schoolCourseDict[degree]) schoolCourseDict[degree] = [];
                    schoolCourseDict[degree].push(index)
                } else if (category_name === 'section_order') {
                    // section order isn't checkbox basd so needs special treatment
                    // literally just the data as-is
                    resumeData[key] = JSON.parse(val)
                }
            }
        }

        // Filter courses based on schoolCourseDict
        if (resumeData["schools"]) {
            resumeData["schools"].forEach(school => {
                const schoolID = school.schoolID
                const indexesToKeep = schoolCourseDict[schoolID];

                if (indexesToKeep) {
                    const indexesToKeep = schoolCourseDict[schoolID]; // discard any schools that weren't checked
                    // Filter the courses array based on the indexes to keep
                    school.courses = school.courses.filter((_, i) => indexesToKeep.includes(i));
                } else {
                    school.courses = []
                }
            });
        }

        // Ensure output directory exists
        if (!(await exists(OUTPUT_DIR))) {
            await fs.mkdir(OUTPUT_DIR);
            console.log(`Created output directory: ${OUTPUT_DIR}`);
        }

        // Write output JSON
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(resumeData, null, 2));
        console.log(`Wrote resume JSON to ${OUTPUT_FILE}`);

        // Run Python PDF generator
        const pythonProcess = spawn('python', ['pdfGenerator.py']);
        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                console.log('PDF generation succeeded.');
                res.send("JSON generated successfully and PDF generated");
            } else {
                console.error(`Python script error: ${errorOutput}`);
                res.status(500).send("An error occurred during PDF generation.");
            }
        });


    } catch (err) {
        console.error('Error handling /generate-json:', err);
        res.status(500).send('Internal Server Error');
    }

});

// Utility to check if a path exists
async function exists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use((req, res) => {
    res.status(404).send(`404 Not Found: ${req.originalUrl}`);
});