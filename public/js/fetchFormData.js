export async function fetchFormData() {
    try {
        const [masterlistResponse, referenceResponse] = await Promise.all([
            fetch('../data/masterlist_data.json'),
            fetch('../data/reference_data.json')
        ]);

        if (!masterlistResponse.ok || !referenceResponse.ok) {
            throw new Error('Failed to load one or both JSON files.');
        }

        const masterlistData = await masterlistResponse.json();
        const referenceData = await referenceResponse.json();

        console.log("Form data loaded.")
        return { masterlistData, referenceData };
    } catch (error) {
        console.error("Error fetching form data:", error);
        throw error;
    }
}
