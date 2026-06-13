window.Redrob = window.Redrob || {};

window.Redrob.EducationEvaluator = {
  score(candidate, jobProfile) {
    const utils = window.Redrob.Utils;
    
    let degreeRelevance = 0;
    let academicStrength = 0;
    let certificationMatch = 0;
    const matchedCerts = [];
    
    const reqEdu = jobProfile.education_requirements || [];
    const hasSpecificEduReqs = reqEdu.length > 0;
    
    const educations = candidate.education || [];
    const certs = candidate.certifications || [];
    
    // Baseline score if no requirements and candidate has no education listed
    if (!hasSpecificEduReqs && educations.length === 0) {
      return { score: 70, details: { degreeRelevance: 70, academicStrength: 50, certificationMatch: 0, matchedCerts: [] } };
    }

    // Evaluate degrees
    let highestDegreeRelevance = 0;
    let bestGpaScore = 0;
    
    for (const edu of educations) {
      // Relevance
      let rel = 0;
      const fieldStr = (edu.field || '').toLowerCase();
      
      // Rough domain match for demo
      if (hasSpecificEduReqs && reqEdu.some(req => fieldStr.includes(req.toLowerCase()))) {
        rel = 100;
      } else if (utils.containsAny(fieldStr, ['computer science', 'engineering', 'math', 'physics'])) {
        rel = 80; // Tech relevance heuristic
      } else if (edu.degree) {
        rel = 40; // Has some degree
      }
      
      highestDegreeRelevance = Math.max(highestDegreeRelevance, rel);
      
      // Academic strength (GPA)
      if (edu.gpa) {
        let gpaScore = 0;
        if (edu.gpa >= 3.8) gpaScore = 100;
        else if (edu.gpa >= 3.5) gpaScore = 85;
        else if (edu.gpa >= 3.0) gpaScore = 70;
        else gpaScore = 50;
        bestGpaScore = Math.max(bestGpaScore, gpaScore);
      }
    }
    
    degreeRelevance = educations.length > 0 ? highestDegreeRelevance : 10; // 10 penalty for no degree if required
    academicStrength = bestGpaScore || 70; // Default if no GPA provided
    
    // Evaluate certifications
    let certScore = 0;
    // Just a placeholder heuristic for cert matching
    for(const cert of certs) {
       for(const skill of (jobProfile.required_skills || [])) {
           if(cert.toLowerCase().includes(skill.toLowerCase())) {
               certScore += 50;
               matchedCerts.push(cert);
               break;
           }
       }
    }
    certificationMatch = utils.clamp(certScore, 0, 100);

    const finalScore = hasSpecificEduReqs 
      ? (degreeRelevance * 0.5 + academicStrength * 0.2 + certificationMatch * 0.3)
      : (degreeRelevance * 0.4 + academicStrength * 0.2 + certificationMatch * 0.4 + 20); // softer penalty if not req

    return {
      score: Math.round(utils.clamp(finalScore, 0, 100)),
      details: {
        degreeRelevance: Math.round(degreeRelevance),
        academicStrength: Math.round(academicStrength),
        certificationMatch: Math.round(certificationMatch),
        matchedCerts
      }
    };
  }
};
