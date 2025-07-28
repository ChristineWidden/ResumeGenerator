console.log("loading handleScripts.js");

async function main() {
    try {
        await populateForm();
        handleDropdowns();
        setUpDragDrop();
        document.dispatchEvent(new Event('formReady')); 
        submitForm();
    } catch (error) {
        console.error('Error:', error);
    }
}

main();