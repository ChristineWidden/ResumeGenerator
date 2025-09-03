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
        recGenThing(checkboxDiv, item, numRecs);

        checklistDiv.appendChild(checkboxDiv);
    });

    parent.appendChild(checklistDiv);
}
