// js/sectionFactories/generateSection.js

import makeChecklistSection from './makeChecklistSection.js';
import makeDropdownSection from './makeDropdownSection.js';
import makeReorderSection from './makeReorderSection.js';

export default function generateSection(key, checkValue, realValue) {
    let sectionDiv = document.createElement('div');
    sectionDiv.id = `${key}_div`;
    sectionDiv.className = 'section_div';

    if (key === 'section_order') {
        sectionDiv.setAttribute('section-type', 'reorder');
        makeReorderSection(sectionDiv, checkValue);
    } else if (Array.isArray(checkValue)) {
        sectionDiv.setAttribute('section-type', 'multi-value');
        makeChecklistSection(sectionDiv, key, realValue, 0);
    } else {
        sectionDiv.setAttribute('section-type', 'single-value');
        makeDropdownSection(sectionDiv, key, realValue);
    }

    return sectionDiv;
}
