import { recGenChecklist } from "./recGenChecklist.js";


// 🧩 Recursive Form Field Generator Helpers

export function recGenThing(parent, thing, numRecs) {
    if (numRecs > 20) return;

    if (typeof thing === 'string') {
        const div = document.createElement("div");
        div.className = "string_item";
        div.innerText = thing;
        parent.appendChild(div);

    } else if (Array.isArray(thing)) {
        const div = document.createElement("div");
        for (const item of thing) {
            const li = document.createElement("li");
            recGenThing(li, item, numRecs + 1);
            div.appendChild(li);
        }
        parent.appendChild(div);

    } else {
        const div = document.createElement("div");
        div.className = "content";

        for (const key in thing) {
            const container = document.createElement("div");
            const label = document.createElement("label");
            label.textContent = `${key}: `;
            container.appendChild(label);

            if (key === "courses") {
                recGenChecklist(container, `${key}.${thing["schoolID"]}`, thing[key], numRecs + 1);
            } else {
                recGenThing(container, thing[key], numRecs + 1);
            }

            div.appendChild(container);
        }
        parent.appendChild(div);
    }
}
