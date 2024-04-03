console.log("loading handleScripts.js");

async function main() {
    try {
        await populateForm();
        handleDropdowns();
        setUpDragDrop();
        submitForm();
    } catch (error) {
        console.error('Error:', error);
    }
}

main();