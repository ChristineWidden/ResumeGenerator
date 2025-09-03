import { fetchFormData } from './fetchFormData.js';
import generateSection from './sectionFactories/generateSection.js'

console.log("✅ Loading populate.js");

export default async function populateForm() {
    console.log("⚙️ Running populateForm");

    try {
        const { masterlistData, referenceData } = await fetchFormData();

        console.log(masterlistData)
        console.log(referenceData)

        const form = document.getElementById("resumeForm")

        for (const key in referenceData) {
            
            // TODO what does this do?
            if (!Object.hasOwnProperty.call(referenceData, key)) continue;

            // Used just to find out how to format things, what items to make
            const checkValue = referenceData[key];
            // The actual data from the masterlist that will be put in.
            const realValue = masterlistData[key];

            const sectionDiv = generateSection(key, checkValue, realValue);
            form.appendChild(sectionDiv)
        }

        resumeForm.innerHTML += `
            <div class="section_div">
            <button type="submit">Generate JSON</button>
            <div id="messageContainer"></div>
            </div>
            `;
    } catch (err) {
        console.error("❌ Failed to populate form:", err);
        document.getElementById("messageContainer").innerText = "Error loading form data.";
    }
    console.log("✅ Form populated");
}
