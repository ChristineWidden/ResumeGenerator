// js/sectionFactories/makeChecklistSection.js

import { recGenChecklist } from '../renderUtils/recGenChecklist.js';

export default function makeChecklistSection(sectionDiv, key, realValue, level = 0) {
    const label = document.createElement('div');
    label.className = 'title';
    label.setAttribute('for', key);
    label.textContent = key;
    sectionDiv.appendChild(label);

    recGenChecklist(sectionDiv, key, realValue, level);
}
