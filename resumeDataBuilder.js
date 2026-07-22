function buildSelectedSkills(skillDict, masterlistData) {
  if (!skillDict || !masterlistData || !Array.isArray(masterlistData.skills)) {
    return [];
  }

  return masterlistData.skills.flatMap((category) => {
    if (!category || !Array.isArray(category.skills)) return [];

    const indexes = skillDict[category.name] || [];
    const selectedSkills = indexes
      .map((index) => category.skills[index])
      .filter(Boolean);

    return selectedSkills.length > 0 ? [{ name: category.name, skills: selectedSkills }] : [];
  });
}

module.exports = { buildSelectedSkills };
