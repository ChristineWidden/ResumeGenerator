export default function makeDropdownSection(sectionDiv, key, realValue) {

    const dropdownID = `${key}_dropdown`;

    // Add a label to the left of the dropdown
    const label = document.createElement('label');
    label.setAttribute("for", dropdownID);
    label.className = "title";
    label.textContent = `${key}:`;

    const dropdownHolder = document.createElement("div")
    dropdownHolder.className = "custom-select"
    dropdownHolder.setAttribute("name", `${dropdownID}_select`);

    const dropdown = document.createElement("select")
    dropdown.name = key
    dropdown.className = "dynamic-dropdown"
    dropdown.id = dropdownID
    dropdownHolder.appendChild(dropdown)

    const input = document.createElement("input")
    input.name = key
    input.type = "text"
    input.style.display = "none";

    sectionDiv.appendChild(label)
    sectionDiv.appendChild(dropdownHolder)
    sectionDiv.appendChild(input)

    realValue.forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val;
        dropdown.appendChild(option);
    });

    const otherOption = document.createElement('option');
    otherOption.value = "Other";
    otherOption.textContent = "Other";
    dropdown.appendChild(otherOption);

    // Restore saved dropdown values
    const savedData = JSON.parse(localStorage.getItem('resumeFormData') || '{}');
    const savedValue = savedData[key];

    if (savedValue) {
        dropdown.value = savedValue;
        input.value = savedValue;
        if (!realValue.includes(savedValue) && savedValue !== "Other") {
            dropdown.value = "Other";
            input.style.display = "inline-block";
        }
    }
}