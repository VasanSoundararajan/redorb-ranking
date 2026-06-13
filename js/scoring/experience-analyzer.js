window.Redrob = window.Redrob || {};

window.Redrob.ExperienceAnalyzer = {
  score(candidate, jobProfile) {
    const utils = window.Redrob.Utils;
    
    let totalYears = candidate.total_experience_years || 0;
    let relevantYears = 0;
    let domainMatchScore = 0;
    let seniorityAlignment = 0;
    const relevantRoles = [];

    const jobDomainKeywords = jobProfile.domain_keywords || [];
    const jobSeniority = jobProfile.seniority;
    const jobMinExp = jobProfile.min_experience || 0;
    const jobMaxExp = jobProfile.max_experience || 99;
    
    if (totalYears === 0 && candidate.experience && candidate.experience.length > 0) {
        for(let role of candidate.experience) {
            totalYears += utils.yearsBetween(role.start_date, role.end_date);
        }
    }

    // Analyze individual roles
    let highestSeniorityIndex = -1;

    for (const role of (candidate.experience || [])) {
      let isRelevant = false;
      const roleStr = `${role.title || ''} ${role.description || ''}`.toLowerCase();
      
      // Check relevance based on skills or domain keywords
      for (const reqSkill of (jobProfile.required_skills || [])) {
         if (roleStr.includes(reqSkill.toLowerCase())) {
             isRelevant = true;
             break;
         }
      }

      if (isRelevant) {
          const years = utils.yearsBetween(role.start_date, role.end_date);
          relevantYears += years;
          relevantRoles.push(role.title);
      }
      
      // Track highest seniority
      const senIndex = utils.getSeniorityIndex(role.title);
      if (senIndex > highestSeniorityIndex) {
          highestSeniorityIndex = senIndex;
      }
      
      // Check domain match
      if (jobProfile.industry && role.domain && role.domain.toLowerCase() === jobProfile.industry.toLowerCase()) {
          domainMatchScore += 20;
      } else {
          for(let keyword of jobDomainKeywords) {
              if (roleStr.includes(keyword.toLowerCase())) {
                  domainMatchScore += 5;
              }
          }
      }
    }
    
    domainMatchScore = utils.clamp(domainMatchScore, 0, 100);

    // Seniority Alignment
    const reqSenIndex = utils.getSeniorityIndex(jobSeniority);
    if (reqSenIndex === -1 || highestSeniorityIndex === -1) {
        seniorityAlignment = 100; // Can't determine
    } else {
        const diff = Math.abs(reqSenIndex - highestSeniorityIndex);
        if (diff === 0) seniorityAlignment = 100;
        else if (diff === 1) seniorityAlignment = 80;
        else if (diff === 2) seniorityAlignment = 60;
        else seniorityAlignment = 40;
    }
    
    // Total Experience Range fit
    let expFitScore = 100;
    if (totalYears < jobMinExp) {
        const deficit = jobMinExp - totalYears;
        expFitScore = Math.max(0, 100 - (deficit * 20)); // Penalty for under
    } else if (totalYears > jobMaxExp + 5) {
        expFitScore = 90; // Overqualified penalty
    }

    // Weighted final score
    const finalScore = (
        (relevantYears >= jobMinExp ? 100 : (relevantYears/Math.max(1, jobMinExp))*100) * 0.4 +
        expFitScore * 0.2 +
        domainMatchScore * 0.2 +
        seniorityAlignment * 0.2
    );

    return {
      score: Math.round(utils.clamp(finalScore, 0, 100)),
      details: {
        totalYears: Math.round(totalYears * 10) / 10,
        relevantYears: Math.round(relevantYears * 10) / 10,
        domainMatch: Math.round(domainMatchScore),
        seniorityAlignment: Math.round(seniorityAlignment),
        relevantRoles
      }
    };
  }
};
