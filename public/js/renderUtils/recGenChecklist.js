import { } from "../populateForm.js";
import { recGenThing } from "./recGenThing.js";


export function recGenChecklist(parent, formName, itemList, numRecs) {
    if (numRecs > 20) return;

    const checklistDiv = document.createElement("div");
    checklistDiv.className = "checklist-container";

    itemList.forEach((item, index) => {
        const checkboxDiv = document.createElement("div");
        checkboxDiv.className = "checkbox-container";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = `${formName}.${index}`;

        checkboxDiv.appendChild(checkbox);

        const contextName = `${formName}.${index}`
        recGenThing(checkboxDiv, item, numRecs, contextName);

        checklistDiv.appendChild(checkboxDiv);
    });

    parent.appendChild(checklistDiv);
}

/**
 * Auto-select the first radio option in all select_* groups that belong to a given context.
 * Example contextName: "work_experience.2" -> matches radio groups named "work_experience.2.select_title"
 */
export function autoSelectFirstRadioOptions(contextName) {
    const form = document.getElementById('resumeForm');
    if (!form) return;

    const radiosByGroupName = new Map();

    for (const element of form.elements) {
        if (element.type === 'radio' && element.name.startsWith(contextName + '.select_')) {
            if (!radiosByGroupName.has(element.name)) {
                radiosByGroupName.set(element.name, []);
            }
            radiosByGroupName.get(element.name).push(element);
        }
    }

    radiosByGroupName.forEach((radios) => {
        radios.sort((a, b) => {
            const aIdx = parseInt(a.getAttribute('data-option-index') || '0');
            const bIdx = parseInt(b.getAttribute('data-option-index') || '0');
            return aIdx - bIdx;
        });

        if (radios.length > 0 && !radios.some(r => r.checked)) {
            radios[0].checked = true;
            radios[0].dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

// Event delegation: listen for checkbox changes anywhere in the document.
// This is robust for dynamically-created checkboxes.
document.addEventListener('change', (e) => {
    const el = e.target;
    if (!el || el.type !== 'checkbox') return;
    // checkbox names use the pattern: <category>.<index> (e.g. work_experience.2)
    const name = el.name || '';
    if (!/\.[0-9]+$/.test(name)) return;

    // When checked, auto-select the first select_* radio option under that context
    if (el.checked) {
        autoSelectFirstRadioOptions(name);
    }
});