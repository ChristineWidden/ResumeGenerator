import { recGenChecklist } from "./recGenChecklist.js";


// Recursive Form Field Generator Helpers

export function recGenThing(parent, thing, numRecs, contextName = '') {
    if (numRecs > 20) return;

    if (typeof thing === 'string') {
        const p = document.createElement("p");
        p.className = "string_item";
        p.innerText = thing;
        parent.appendChild(p);

    } else if (Array.isArray(thing)) {
        const div = document.createElement("div");
        div.className = "array_item";
        for (const item of thing) {
            const li = document.createElement("li");
            recGenThing(li, item, numRecs + 1, contextName);
            div.appendChild(li);
        }
        parent.appendChild(div);

    } else {
        const div = document.createElement("div");
        div.className = "content";

        for (const key in thing) {
            // keywords are to be ignored
            if (key === "keywords") continue;

            const container = document.createElement("div");
            container.className = "containerx";

            const label = document.createElement("label");
            label.textContent = `${key}: `;
            container.appendChild(label);

            if (key === "courses") {
                const schoolId = thing["schoolID"] || key;
                recGenChecklist(container, `${key}.${schoolId}`, thing[key], numRecs + 1);
            } else if (key === "skills") {
                const skillId = thing["name"] || key;
                recGenChecklist(container, `${key}.${skillId}`, thing[key], numRecs + 1);
            } else if (key.startsWith("select_") && Array.isArray(thing[key])) {
                // Keys that start with "select_" are treated as single-choice alternatives
                // Example: select_title: ["Short Title", "Long Title"]
                // Example: select_description: [ ["bullet1", "bullet2"], ["bullet1", "bullet2", "bullet3"] ]
                //   Each element in the array is ONE option (which itself is an array of bullets if it's a description)

                const radioGroup = document.createElement("div");
                radioGroup.className = "radio-group";

                const groupName = contextName ? `${contextName}.${key}` : key;

                thing[key].forEach((option, idx) => {
                    const optionWrapper = document.createElement("div");
                    optionWrapper.className = "radio-option";

                    const radio = document.createElement("input");
                    radio.type = "radio";
                    // radio.name = `${groupName}.${idx}`;
                    radio.name = `${groupName}`;
                    radio.id = `${groupName}.${idx}`;
                    // Value is the index of the selected option
                    radio.value = idx.toString();
                    radio.setAttribute('data-option-index', idx.toString());

                    const optionLabel = document.createElement("label");
                    optionLabel.htmlFor = radio.id;
                    optionLabel.style.marginLeft = "6px";

                    if (typeof option === "string") {
                        // Simple string option (e.g., title)
                        optionLabel.textContent = option;
                    } else if (Array.isArray(option)) {
                        // Array option (e.g., description with bullets)
                        const preview = document.createElement("ul");
                        preview.className = "option-preview";
                        if (option.length === 0) {
                            const li = document.createElement("li");
                            li.textContent = "[Leave Blank]";
                            preview.appendChild(li);
                        } else {
                            option.forEach(b => {
                                const li = document.createElement("li");
                                li.textContent = b;
                                preview.appendChild(li);
                            });
                        }
                        optionLabel.appendChild(preview);
                    } else {
                        optionLabel.textContent = `Option ${idx + 1}`;
                    }

                    optionWrapper.appendChild(radio);
                    optionWrapper.appendChild(optionLabel);
                    radioGroup.appendChild(optionWrapper);
                });

                container.appendChild(radioGroup);

            } else {
                recGenThing(container, thing[key], numRecs + 1, contextName);
            }

            div.appendChild(container);
        }
        parent.appendChild(div);
    }
}
