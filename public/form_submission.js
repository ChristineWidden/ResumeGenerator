function submitForm() {
    // Handle form submission
    const form = document.getElementById('resumeForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const data = Array.from(sortable.querySelectorAll('li')).map(li => li.textContent);
        document.getElementById('section_order').value = JSON.stringify(data);
        console.log(data); // Log the order of items for debugging
        // form.submit()
        
        // Perform form submission asynchronously using AJAX
        const formData = new FormData(form);
        console.log("FORM DATA")
        console.log(formData)
        fetch('/generate-json', {
            method: 'POST',
            body: formData
        })
        .then(async response => {
            messageContainer.textContent = await response.text()

        })
        .catch(error => {
            console.error('Error submitting form:', error);
            messageContainer.textContent = 'ERROR: ' + error;
        });
    });
}