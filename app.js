const fs = require('fs/promises')
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { spawn } = require('child_process');
const multer = require('multer');
const { buildSelectedSkills } = require('./resumeDataBuilder');
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
        const skillDict = {}
        const selectOptionsDict = {} // Track selected indices for select_* fields

        // Parse form input into structured JSON
        for (const key in req.body) {
            const val = req.body[key]

            if (Array.isArray(val)) {
                // Dropdown field with optional "Other" input
                resumeData[key] = val[0] === "Other" ? val[1] : val[0]
                console.log(`Field ${key}: ${resumeData[key]}`);
                continue
            }
            
            // Parse checkbox and radio fields
            // Other data comes as checkboxes
            // in forms like skills.0 skills.1 etc.
            // so here we get the category (name) and the index
            const parts = key.split('.')

            // E.g. ["work_experience","2"] for checkbox
            // or ["work_experience","2","select_title"] for radio group
            const topCategory = parts[0]

            // section_order (special) - stored literally
            if (topCategory === 'section_order') {
                resumeData[key] = JSON.parse(val);
                continue;
            }

            const index = parseInt(parts[parts.length - 1])

            // courses have nested checkboxes so need special treatment
            if (topCategory === 'courses') {
                const degree = parts[1]
                if (!schoolCourseDict[degree]) schoolCourseDict[degree] = [];
                schoolCourseDict[degree].push(index)
                console.log(schoolCourseDict)
                continue
            } 
            // skills have nested checkboxes so need special treatment
            if (topCategory === 'skills') {
                const name = parts[1]
                if (!skillDict[name]) skillDict[name] = [];
                skillDict[name].push(index)
                console.log(skillDict)
                continue
            } 


            // Handle select_* radio fields (e.g., work_experience.2.select_title)
            const selectSegmentIndex = parts.findIndex((p, i) => i > 0 && p.startsWith('select_'));
            if (selectSegmentIndex !== -1) {
                const itemIndex = parseInt(parts[1])
                const selectKey = parts[selectSegmentIndex]
                
                if (!selectOptionsDict[topCategory]) selectOptionsDict[topCategory] = {}
                if (!selectOptionsDict[topCategory][itemIndex]) selectOptionsDict[topCategory][itemIndex] = {}
                
                // Store the selected option index
                selectOptionsDict[topCategory][itemIndex][selectKey] = parseInt(val)
                console.log(`Selected: ${topCategory}[${itemIndex}].${selectKey} = option ${val}`)
                continue
            }

            if (!(resumeData[topCategory])) resumeData[topCategory] = []
            
            const itemFromMasterlist = JSON.parse(JSON.stringify(masterlistData[topCategory][index])) // deep copy
            resumeData[topCategory].push(itemFromMasterlist)
        }

        // Apply selected select_* options to work_experience, projects, etc.
        for (const [category, itemDict] of Object.entries(selectOptionsDict)) {
            if (!resumeData[category]) continue;

            resumeData[category].forEach((item, pushedPosition) => {
                // Find the corresponding masterlist index
                const masterlistArray = masterlistData[category] || [];
                let masterIndex = -1;
                if (item.id) {
                    masterIndex = masterlistArray.findIndex(m => m.id === item.id);
                }
                if (masterIndex === -1) {
                    masterIndex = masterlistArray.findIndex(m => 
                        m.company === item.company && 
                        m.start_date === item.start_date && 
                        m.title === item.title
                    )
                }
                if (masterIndex === -1) {
                    console.warn(`Warning: Could not find matching masterlist item for ${category}[${pushedPosition}]`);
                    return;
                }
                
                if (!itemDict[masterIndex]) return;

                const selections = itemDict[masterIndex]
                const masterItem = masterlistData[category][masterIndex]
                
                // Apply select_title
                if (selections['select_title'] !== undefined && masterItem.select_title) {
                    const selectedIdx = selections['select_title']
                    item.title = masterItem.select_title[selectedIdx]
                }
                
                // Apply select_description
                if (selections['select_description'] !== undefined && masterItem.select_description) {
                    const selectedIdx = selections['select_description']
                    item.description = masterItem.select_description[selectedIdx]
                }
                
            })

        }

        // Filter courses based on schoolCourseDict
        if (resumeData["schools"]) {
            resumeData["schools"].forEach(school => {
                const schoolID = school.schoolID
                const indexesToKeep = schoolCourseDict[schoolID];

                if (indexesToKeep) {
                    school.courses = school.courses.filter((_, i) => indexesToKeep.includes(i));
                } else {
                    school.courses = []
                }
            });
        }
        
        
        // Build the selected skills grouped by category
        resumeData["skills"] = buildSelectedSkills(skillDict, masterlistData);

        // Ensure output directory exists
        if (!(await exists(OUTPUT_DIR))) {
            await fs.mkdir(OUTPUT_DIR);
            console.log(`Created output directory: ${OUTPUT_DIR}`);
        }

        // Write output JSON
        console.log(resumeData)
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