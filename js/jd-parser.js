window.Redrob = window.Redrob || {};

window.Redrob.JDParser = {
  parse(jdText) {
    if (!jdText) return null;
    const text = jdText.toLowerCase();
    const lines = jdText.split('\n').map(l => l.trim()).filter(l => l);
    
    const profile = {
      title: 'Unknown Role',
      required_skills: [],
      preferred_skills: [],
      min_experience: 0,
      max_experience: 99,
      seniority: 'mid',
      education_requirements: [],
      industry: '',
      domain_keywords: [],
      leadership_required: false,
      behavioral_expectations: {
        leadership: 1,
        communication: 1,
        adaptability: 1,
        reliability: 1
      }
    };

    // 1. Extract Title
    if (lines.length > 0) {
      const titleMatch = lines[0].match(/title:\s*(.+)/i) || lines[0].match(/role:\s*(.+)/i) || lines[0].match(/position:\s*(.+)/i);
      if (titleMatch) {
          profile.title = titleMatch[1];
      } else if (lines[0].length < 60) {
          profile.title = lines[0]; // Assume first line is title if it's short
      }
    }

    // 2. Extract Seniority
    profile.seniority = window.Redrob.Utils.SENIORITY_LEVELS[window.Redrob.Utils.getSeniorityIndex(profile.title)] || 'mid';
    if (profile.seniority === 'lead' || profile.seniority === 'manager' || profile.seniority === 'director' || profile.seniority === 'vp' || profile.seniority === 'c-level') {
        profile.leadership_required = true;
        profile.behavioral_expectations.leadership = 2;
    }

    // 3. Extract Experience Range
    const expRegex = /(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years?|yrs?)/i;
    const minExpRegex = /(\d+)\+?\s*(?:years?|yrs?)/i;
    
    let expMatch = jdText.match(expRegex);
    if (expMatch) {
        profile.min_experience = parseInt(expMatch[1], 10);
        profile.max_experience = parseInt(expMatch[2], 10);
    } else {
        expMatch = jdText.match(minExpRegex);
        if (expMatch) {
            profile.min_experience = parseInt(expMatch[1], 10);
        }
    }

    // 4. Extract Skills
    // We'll use our canonical skill list as a dictionary to find skills in the text
    const allSkills = new Set([
        ...Object.keys(window.Redrob.Utils.SKILL_SYNONYMS),
        ...Object.values(window.Redrob.Utils.SKILL_SYNONYMS).flat(),
        ...Object.values(window.Redrob.Utils.SKILL_CLUSTERS).flat()
    ]);
    
    let inPreferredSection = false;
    
    for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes('preferred') || lowerLine.includes('nice to have') || lowerLine.includes('bonus')) {
            inPreferredSection = true;
        } else if (lowerLine.includes('required') || lowerLine.includes('must have') || lowerLine.includes('qualifications')) {
            inPreferredSection = false;
        }
        
        // Find skills in this line
        for (const skill of allSkills) {
            // Regex to match whole word
            const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (skillRegex.test(lowerLine)) {
                const canonical = window.Redrob.Utils.getCanonicalSkill(skill);
                if (inPreferredSection) {
                    if (!profile.preferred_skills.includes(canonical) && !profile.required_skills.includes(canonical)) {
                        profile.preferred_skills.push(canonical);
                    }
                } else {
                    if (!profile.required_skills.includes(canonical)) {
                        profile.required_skills.push(canonical);
                        // Remove from preferred if it was there
                        profile.preferred_skills = profile.preferred_skills.filter(s => s !== canonical);
                    }
                }
            }
        }
    }

    // 5. Education
    if (text.includes('bachelor') || text.includes('bs ') || text.includes('b.s.')) profile.education_requirements.push('Bachelor');
    if (text.includes('master') || text.includes('ms ') || text.includes('m.s.')) profile.education_requirements.push('Master');
    if (text.includes('phd') || text.includes('ph.d')) profile.education_requirements.push('PhD');
    if (text.includes('computer science')) profile.education_requirements.push('Computer Science');

    // 6. Industry/Domain
    if (text.includes('fintech') || text.includes('finance') || text.includes('bank')) profile.industry = 'Finance';
    else if (text.includes('health') || text.includes('medical')) profile.industry = 'Healthcare';
    else if (text.includes('ecommerce') || text.includes('e-commerce') || text.includes('retail')) profile.industry = 'E-commerce';
    
    // 7. Behavioral Expectations
    if (text.includes('fast-paced') || text.includes('startup') || text.includes('dynamic')) {
        profile.behavioral_expectations.adaptability = 1.5;
    }
    if (text.includes('cross-functional') || text.includes('collaborate') || text.includes('communicate')) {
        profile.behavioral_expectations.communication = 1.5;
    }
    if (text.includes('mission-critical') || text.includes('high availability') || text.includes('reliable')) {
        profile.behavioral_expectations.reliability = 1.5;
    }

    return profile;
  }
};
