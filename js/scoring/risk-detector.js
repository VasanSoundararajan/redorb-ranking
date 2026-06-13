window.Redrob = window.Redrob || {};

window.Redrob.RiskDetector = {
  detect(candidate, jobProfile) {
    const utils = window.Redrob.Utils;
    let totalPenalty = 0;
    const risks = [];

    const addRisk = (type, severity, penalty, description) => {
      risks.push({ type, severity, penalty, description });
      totalPenalty += penalty;
    };

    // 1. Keyword Stuffing Detection
    const skills = candidate.skills || [];
    if (skills.length > 30) {
      addRisk('keyword_stuffing', 'high', 15, `Abnormally high skill count (${skills.length} skills listed)`);
    } else if (skills.length > 20) {
      addRisk('keyword_stuffing', 'medium', 5, `High skill count (${skills.length} skills listed)`);
    }
    
    // 2. Inconsistency Detection
    let expYearsClaimed = candidate.total_experience_years || 0;
    let calculatedYears = 0;
    const experiences = candidate.experience || [];
    experiences.forEach(exp => {
        calculatedYears += utils.yearsBetween(exp.start_date, exp.end_date);
    });
    
    if (expYearsClaimed > 0 && calculatedYears > 0) {
        if (expYearsClaimed > calculatedYears + 2) {
            addRisk('inconsistency', 'high', 15, `Claimed experience (${expYearsClaimed} yrs) exceeds calculated role durations (${Math.round(calculatedYears)} yrs)`);
        }
    }
    
    if (experiences.length > 0) {
        const highestSeniority = utils.getSeniorityIndex(experiences[0].title);
        if (highestSeniority >= 6 && calculatedYears < 4) { // Director+ with < 4 years
            addRisk('inconsistency', 'high', 20, `Unrealistic seniority (${experiences[0].title}) for total experience (${Math.round(calculatedYears)} yrs)`);
        }
    }

    // 3. Honeypot Detection (CRITICAL)
    let isHoneypot = false;
    
    // Impossible tech experience (e.g. 10 years of a 5 year old tech)
    for(const skill of skills) {
        const sName = typeof skill === 'string' ? skill : skill.name;
        const sYears = typeof skill === 'string' ? 0 : skill.years;
        // TypeScript was released in 2012. Over 15 years is impossible.
        if (sName.toLowerCase().includes('typescript') && sYears > 15) {
            addRisk('honeypot', 'critical', 50, `Impossible experience claim: ${sYears} years of TypeScript`);
            isHoneypot = true;
        }
    }
    
    // Suspiciously perfect behavioral scores
    const sigs = candidate.behavioral_signals || {};
    const sigValues = Object.values(sigs);
    if (sigValues.length > 3 && sigValues.every(v => v >= 98)) {
         addRisk('honeypot', 'critical', 30, `Suspiciously perfect behavioral signals`);
         isHoneypot = true;
    }
    
    // "led a team of 50" at "startup with 30 employees" (We simulate this by checking for large numbers in small companies, hard to do perfectly without external data, but we look for contradictions)
    for(const exp of experiences) {
        if(exp.description && exp.description.toLowerCase().includes('led a team of 50') && 
           (exp.company.toLowerCase().includes('startup') || exp.company.toLowerCase().includes('stealth'))) {
             addRisk('honeypot', 'critical', 40, `Unrealistic team size claims for startup role`);
             isHoneypot = true;
        }
    }

    // 4. Behavioral Mismatch
    if (jobProfile.leadership_required && sigs.leadership && sigs.leadership < 40) {
        addRisk('behavioral_mismatch', 'medium', 10, 'Leadership role requires stronger leadership signals');
    }

    return {
      totalPenalty: Math.min(totalPenalty, 50), // Cap penalty at 50
      risks
    };
  }
};
