window.Redrob = window.Redrob || {};

window.Redrob.CandidateNormalizer = {
  normalize(rawCandidates) {
    if (!Array.isArray(rawCandidates)) return [];
    
    return rawCandidates.map(c => {
      // Map from the new Redrob schema
      const profile = c.profile || {};
      
      const normalized = {
        candidate_id: c.candidate_id || `C_${Math.random().toString(36).substr(2, 9)}`,
        name: profile.name || profile.anonymized_name || 'Unknown Candidate',
        title: profile.headline || profile.current_title || 'Unknown Title',
        summary: profile.summary || '',
        total_experience_years: profile.years_of_experience || 0,
      };
      
      // Normalize skills
      if (c.skills && Array.isArray(c.skills)) {
          normalized.skills = c.skills.map(s => {
             if (typeof s === 'string') {
                 return { name: s, years: 0, level: 'intermediate' };
             }
             return {
                 name: s.name,
                 years: s.duration_months ? Math.round((s.duration_months / 12) * 10) / 10 : 0,
                 level: s.proficiency || 'intermediate'
             };
          });
      } else {
          normalized.skills = [];
      }
      
      // Normalize experience from career_history
      if (c.career_history && Array.isArray(c.career_history)) {
          normalized.experience = c.career_history.map(ch => ({
              title: ch.title,
              company: ch.company,
              domain: ch.industry,
              start_date: ch.start_date,
              end_date: ch.end_date,
              description: ch.description,
              // Try to extract some achievements if possible, or just leave empty
              achievements: [] 
          }));
      } else {
          normalized.experience = c.experience || [];
      }
      
      // Calculate total experience if still missing
      if (!normalized.total_experience_years && normalized.experience.length > 0) {
          let total = 0;
          normalized.experience.forEach(exp => {
              total += window.Redrob.Utils.yearsBetween(exp.start_date, exp.end_date);
          });
          normalized.total_experience_years = Math.round(total * 10) / 10;
      }
      
      // Normalize education
      if (c.education && Array.isArray(c.education)) {
          normalized.education = c.education.map(edu => {
              let gpa = null;
              if (edu.grade) {
                  const match = edu.grade.match(/(\d+\.\d+)/);
                  if (match) {
                      gpa = parseFloat(match[1]);
                      if (edu.grade.toLowerCase().includes('cgpa') && gpa > 4) {
                          gpa = (gpa / 10) * 4; // Roughly convert 10-point CGPA to 4.0 scale
                      }
                  }
              }
              return {
                  degree: edu.degree,
                  field: edu.field_of_study || edu.field,
                  institution: edu.institution,
                  gpa: gpa,
                  year: edu.end_year || edu.year
              };
          });
      } else {
          normalized.education = c.education || [];
      }
      
      normalized.certifications = c.certifications || [];
      
      // Pass raw signals through for behavioral-intelligence engine
      normalized.redrob_signals = c.redrob_signals || {};
      
      return normalized;
    });
  },
  
  validate(candidate) {
      const warnings = [];
      const errors = [];
      
      if (!candidate.name || candidate.name === 'Unknown Candidate') errors.push("Candidate missing name");
      if (!candidate.candidate_id) errors.push("Candidate missing ID");
      if (!candidate.skills || candidate.skills.length === 0) warnings.push("No skills listed");
      if (!candidate.experience || candidate.experience.length === 0) warnings.push("No experience listed");
      
      return {
          valid: errors.length === 0,
          warnings,
          errors
      };
  }
};
