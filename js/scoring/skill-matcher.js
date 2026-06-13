window.Redrob = window.Redrob || {};

window.Redrob.SkillMatcher = {
  score(candidate, jobProfile) {
    const utils = window.Redrob.Utils;
    
    let directMatches = 0;
    let relatedMatches = 0;
    let missingCritical = 0;
    let skillDepthScore = 0;
    
    const matchedSkills = [];
    const relatedSkills = [];
    const missingSkills = [];
    
    const reqSkills = jobProfile.required_skills || [];
    const prefSkills = jobProfile.preferred_skills || [];
    
    const candidateSkills = (candidate.skills || []).map(s => {
      if (typeof s === 'string') return { name: s, years: 0, level: 'intermediate' };
      return s;
    });

    const candidateSkillNames = candidateSkills.map(s => utils.getCanonicalSkill(s.name));

    // Check required skills (Weight: 2.0)
    let reqScore = 0;
    for (const reqSkill of reqSkills) {
      const canonicalReq = utils.getCanonicalSkill(reqSkill);
      
      if (candidateSkillNames.includes(canonicalReq)) {
        directMatches++;
        matchedSkills.push(reqSkill);
        reqScore += 2.0;
        
        // Bonus for depth
        const cSkill = candidateSkills.find(s => utils.getCanonicalSkill(s.name) === canonicalReq);
        if (cSkill && cSkill.years >= 3) {
          skillDepthScore += 0.5;
        }
      } else {
        // Check for related skills
        let foundRelated = false;
        for (const cSkill of candidateSkillNames) {
          if (utils.areSkillsRelated(canonicalReq, cSkill)) {
            relatedMatches++;
            relatedSkills.push(reqSkill);
            reqScore += 0.8; // Partial credit
            foundRelated = true;
            break;
          }
        }
        
        if (!foundRelated) {
          missingCritical++;
          missingSkills.push(reqSkill);
          // Penalty for missing required skill
          reqScore -= 1.0; 
        }
      }
    }

    // Check preferred skills (Weight: 1.0)
    let prefScore = 0;
    for (const prefSkill of prefSkills) {
      const canonicalPref = utils.getCanonicalSkill(prefSkill);
      
      if (candidateSkillNames.includes(canonicalPref)) {
        directMatches++;
        matchedSkills.push(prefSkill);
        prefScore += 1.0;
        
        const cSkill = candidateSkills.find(s => utils.getCanonicalSkill(s.name) === canonicalPref);
        if (cSkill && cSkill.years >= 3) {
          skillDepthScore += 0.2;
        }
      } else {
        // Check for related skills
        for (const cSkill of candidateSkillNames) {
          if (utils.areSkillsRelated(canonicalPref, cSkill)) {
            relatedMatches++;
            relatedSkills.push(prefSkill);
            prefScore += 0.4;
            break;
          }
        }
      }
    }

    const maxPossibleReqScore = reqSkills.length * 2.0;
    const maxPossiblePrefScore = prefSkills.length * 1.0;
    const maxPossibleTotal = maxPossibleReqScore + maxPossiblePrefScore;
    
    let finalScore = 0;
    if (maxPossibleTotal > 0) {
      let rawScore = reqScore + prefScore + skillDepthScore;
      // Normalization logic
      finalScore = (rawScore / maxPossibleTotal) * 100;
      finalScore = utils.clamp(finalScore, 0, 100);
    } else {
      finalScore = 100; // No requirements
    }

    return {
      score: Math.round(finalScore),
      details: {
        directMatches,
        relatedMatches,
        missingCritical,
        skillDepthScore,
        matchedSkills,
        relatedSkills,
        missingSkills
      }
    };
  }
};
