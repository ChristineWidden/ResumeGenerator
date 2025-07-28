// save_form_data.js
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('resumeForm');

    // Load saved data
    const savedData = JSON.parse(localStorage.getItem('resumeFormData') || '{}');

    // Restore saved values
    for (const [key, value] of Object.entries(savedData)) {
        const input = form.elements[key];
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = value;
            } else if (input.type === 'radio') {
                const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
                if (radio) radio.checked = true;
            } else {
                input.value = value;
            }
        }
    }

    ['input', 'change'].forEach(evt =>
        form.addEventListener(evt, () => {
            const dataToSave = {};
            const processedNames = new Set();

            for (const element of form.elements) {
                const name = element.name;
                if (!name || processedNames.has(name)) continue;

                // Handle "custom dropdown + input" combo
                const dropdown = form.querySelector(`select[name="${name}"]`);
                const input = form.querySelector(`input[type="text"][name="${name}"]`);

                if (dropdown && input) {
                    const isOther = dropdown.value === "Other";
                    dataToSave[name] = isOther ? input.value : dropdown.value;
                    processedNames.add(name);
                    continue;
                }

                // Regular input/checkbox/radio
                if (element.type === 'checkbox') {
                    dataToSave[name] = element.checked;
                } else if (element.type === 'radio') {
                    if (element.checked) dataToSave[name] = element.value;
                } else {
                    dataToSave[name] = element.value;
                }

                processedNames.add(name);
            }

            localStorage.setItem('resumeFormData', JSON.stringify(dataToSave));
            // console.log("Data changed")
        })
    );
});

document.addEventListener('formReady', () => {
    const form = document.getElementById('resumeForm');
    const savedData = JSON.parse(localStorage.getItem('resumeFormData') || '{}');

    for (const element of form.elements) {
        if (element.id) {
            console.log(element.id)
        }

        if (!element.name) continue;

        if (savedData.hasOwnProperty(element.name)) {
            console.log(element.name + ' is a ' + element.type)
            if (element.type === 'checkbox') {
                element.checked = savedData[element.name];
            } else if (element.type === 'select-one') {
                // element.value = savedData[element.name];
            } else if (element.type === 'text') {
                element.value = savedData[element.name];
            } else if (element.type === 'hidden') {
                // do nothing
            } else {
                console.log(element.name + ' is a ' + element.type)
            }

            // Manually trigger input/change if needed (e.g., to show custom fields)
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    console.log("Loaded saved data!")
});
