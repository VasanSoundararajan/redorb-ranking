window.Redrob = window.Redrob || {};

window.Redrob.CareerScorer = {
  score(candidate, jobProfile) {
    const utils = window.Redrob.Utils;
    
    let promotions = 0;
    let responsibilityGrowthScore = 50; // Start neutral
    let stabilityScore = 0;
    let leadershipGrowthScore = 0;
    
    const experiences = candidate.experience || [];
    
    if (experiences.length === 0) {
      return { score: 50, details: { promotions: 0, responsibilityGrowth: 50, stability: 50, leadershipGrowth: 0 } };
    }

    // Sort by date (assuming they are usually reverse chronological, but let's be safe)
    // Actually, we'll assume they are in reverse chronological order (newest first)
    // We will iterate from oldest to newest to track progression
    const sortedExp = [...experiences].reverse();
    
    let prevIndex = -1;
    let totalTenure = 0;
    
    for (let i = 0; i < sortedExp.length; i++) {
      const exp = sortedExp[i];
      const currIndex = utils.getSeniorityIndex(exp.title);
      
      // Promotions
      if (prevIndex !== -1 && currIndex > prevIndex) {
        // Did they stay at same company? 
        const prevExp = sortedExp[i-1];
        if (prevExp && prevExp.company === exp.company) {
            promotions += 1.5; // internal promotion counts more
        } else {
            promotions += 1.0; // level up via job hop
        }
      }
      prevIndex = currIndex;
      
      // Tenure
      totalTenure += utils.yearsBetween(exp.start_date, exp.end_date);
    }
    
    let promoScore = Math.min(100, promotions * 20);
    
    // Responsibility Growth (heuristic based on keywords in description)
    const respKeywords = ['led', 'managed', 'directed', 'architected', 'designed', 'scale', 'team', 'department', 'organization'];
    let respCount = 0;
    for (const exp of experiences) {
       if (utils.containsAny(exp.description, respKeywords)) {
           respCount++;
       }
    }
    responsibilityGrowthScore = Math.min(100, 50 + (respCount * 10));

    // Stability (average tenure)
    const avgTenure = totalTenure / Math.max(1, experiences.length);
    if (avgTenure >= 2 && avgTenure <= 5) stabilityScore = 100;
    else if (avgTenure > 5) stabilityScore = 80;
    else if (avgTenure >= 1) stabilityScore = 70;
    else stabilityScore = 40;
    
    // Leadership growth
    if (utils.getSeniorityIndex(experiences[0]?.title) >= 4) { // Lead or above currently
        leadershipGrowthScore = 100;
    } else if (respCount > 0) {
        leadershipGrowthScore = 60;
    } else {
        leadershipGrowthScore = 30;
    }

    const finalScore = (promoScore * 0.25) + (responsibilityGrowthScore * 0.25) + (stabilityScore * 0.25) + (leadershipGrowthScore * 0.25);

    return {
      score: Math.round(utils.clamp(finalScore, 0, 100)),
      details: {
        promotions: promoScore,
        responsibilityGrowth: responsibilityGrowthScore,
        stability: stabilityScore,
        leadershipGrowth: leadershipGrowthScore
      }
    };
  }
};
