
console.log("loading handleScripts.js");

import populateForm from './populateForm.js';
import handleDropdowns from './handle_dropdowns.js';
import setUpDragDrop from './drag_drop.js';
import submitForm from './form_submission.js';

async function main() {
    console.log("running main in handleScripts.js");
    try {
        await populateForm();
        setUpDragDrop();
        document.dispatchEvent(new Event('formReady'));
        handleDropdowns();
        submitForm();
    } catch (error) {
        console.error('Error in handleScripts.js:', error);
    }
}

main();
