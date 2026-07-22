const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSelectedSkills } = require('../resumeDataBuilder');

test('buildSelectedSkills groups checked skills by category', () => {
  const masterlistData = {
    skills: [
      { name: 'Languages', skills: ['C++', 'C#', 'Python'] },
      { name: 'Operating Systems', skills: ['Windows', 'Mac', 'Linux'] }
    ]
  };

  const skillDict = {
    Languages: [0, 2],
    'Operating Systems': [1]
  };

  const result = buildSelectedSkills(skillDict, masterlistData);

  assert.deepEqual(result, [
    { name: 'Languages', skills: ['C++', 'Python'] },
    { name: 'Operating Systems', skills: ['Mac'] }
  ]);
});
