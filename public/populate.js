console.log("loading populate.js")

function recGenThing(parent, thing, numRecs) {
    if (numRecs > 20) {
        return;
    }

    if (typeof thing === 'string') {
        const div = document.createElement("div")
        div.className = "string_item"
        div.innerText = thing
        parent.appendChild(div)

    } else if (Array.isArray(thing)) {

        const div = document.createElement("div");
        // div.setAttribute("style", "display:inline-block;")
        thing.forEach(item => {
            const li = document.createElement("li")
            div.appendChild(li)
            recGenThing(li, item, numRecs + 1)
        })
        parent.appendChild(div)

    } else {
        const div = document.createElement("div");
        div.className += " content"
        for (const key in thing) {
            const div2 = document.createElement("div");
            div.appendChild(div2)

            const label = document.createElement("label");
            label.textContent = key + ": ";
            div2.appendChild(label)

            if (key === "courses") {
                recGenChecklist(div2, key + '.' + thing["schoolID"], thing[key], numRecs + 1)
            } else {
                recGenThing(div2, thing[key], numRecs + 1)
            }
        }
        parent.appendChild(div)
    }
}

function recGenChecklist(parent, formName, itemList, numRecs) {

    const checklist_div = document.createElement("div");
    checklist_div.className = "checklist-container"

    let index = 0;
    itemList.forEach(item => {

        const checkbox_div = document.createElement("div");
        checkbox_div.className = "checkbox-container"

        const checkbox = document.createElement('input');
        checkbox.type = "checkbox"
        checkbox.name = "" + formName + "." + index;
        checkbox_div.appendChild(checkbox);
        checklist_div.appendChild(checkbox_div)
        parent.appendChild(checklist_div)

        recGenThing(checkbox_div, item, numRecs)

        index++;
    });
}

async function populateForm() {
    console.log("Running populateForm")
    await Promise.all([
        fetch('masterlist_data.JSON'),
        fetch('reference_data.JSON')
    ])
        .then(responses => Promise.all(responses.map(response => response.json())))
        .then(([masterlistData, templateData]) => {
            const form = document.getElementById("resumeForm")

            for (const key in templateData) {
                const div = document.createElement("div");
                const divId = "" + key + "_div"
                div.setAttribute("id", divId)
                div.className = "section_div"

                if (Object.hasOwnProperty.call(templateData, key)) {
                    const checkValue = templateData[key];
                    const realValue = masterlistData[key];

                    if (Array.isArray(checkValue)) {
                        const label = document.createElement("div");
                        label.setAttribute("for", key)
                        label.className = "title"
                        label.textContent = key
                        div.appendChild(label)

                        if (key === 'section_order') {
                            div.setAttribute("section-type", "reorder")
                            const ul = document.createElement("ul")
                            ul.id = "sortable"

                            ul.innerHTML += '<input type="hidden" name="section_order" id="section_order">';
                            

                            for (sectionName of checkValue) {
                                const li = document.createElement("li")
                                li.setAttribute("draggable", "true")
                                li.className = "draggable"
                                li.textContent = sectionName
                                ul.appendChild(li)
                            }

                            div.appendChild(ul)

                        } else {
                            div.setAttribute("section-type", "multi-value")

    

                            recGenChecklist(div, key, realValue, 0)
                        }
                    } else {
                        div.setAttribute("section-type", "single-value")

                        const dropdownID = "" + key + "_dropdown"

                        const label = document.createElement('label');
                        label.setAttribute("for", dropdownID)
                        label.className = "title"
                        label.textContent = key + ":"

                        const dropdownHolder = document.createElement("div")
                        dropdownHolder.className = "custom-select"

                        const dropdown = document.createElement("select")
                        dropdown.name = key
                        dropdown.className = "dynamic-dropdown"
                        dropdown.id = dropdownID
                        dropdownHolder.appendChild(dropdown)

                        const input = document.createElement("input")
                        input.name = key
                        input.setAttribute("type", "text")
                        input.setAttribute("style", "display: none;")

                        div.appendChild(label)
                        div.appendChild(dropdownHolder)
                        div.appendChild(input)

                        realValue.forEach(val => {
                            const option = document.createElement('option');
                            option.value = val;
                            option.textContent = val;
                            dropdown.appendChild(option);
                        });
                        const other_option = document.createElement('option');
                        other_option.value = "Other";
                        other_option.textContent = "Other";
                        dropdown.appendChild(other_option);
                    }
                }

                form.appendChild(div)
            }

            resumeForm.innerHTML += `
            <div class="section_div">
            <button type="submit">Generate JSON</button>
            <div id="messageContainer"></div>
            </div>
            `

        })
}