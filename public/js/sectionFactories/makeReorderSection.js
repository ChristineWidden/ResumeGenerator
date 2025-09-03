// js/sectionFactories/makeReorderSection.js

export default function makeReorderSection(sectionDiv, checkValue, key) {
    const label = document.createElement('div');
    label.className = 'title';
    label.setAttribute('for', key);
    label.textContent = key;
    sectionDiv.appendChild(label);

    sectionDiv.setAttribute("section-type", "reorder")

    const ul = document.createElement("ul")
    ul.id = "sortable"

    // add hidden input
    ul.innerHTML += '<input type="hidden" name="section_order" id="section_order">';

    for (const sectionName of checkValue) {
        const li = document.createElement("li")
        li.setAttribute("draggable", "true")
        li.className = "draggable"
        li.textContent = sectionName
        ul.appendChild(li)
    }

    sectionDiv.appendChild(ul)
}
