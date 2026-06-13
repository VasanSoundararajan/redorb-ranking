window.Redrob = window.Redrob || {};

window.Redrob.AchievementScorer = {
  score(candidate, jobProfile) {
    const utils = window.Redrob.Utils;
    
    let quantScore = 0;
    let bizScore = 0;
    let techScore = 0;
    const topAchievements = [];
    
    const experiences = candidate.experience || [];
    
    // Flatten achievements
    let allAchievements = [];
    experiences.forEach(exp => {
      if (exp.achievements && Array.isArray(exp.achievements)) {
        allAchievements.push(...exp.achievements);
      }
    });

    if (allAchievements.length === 0) {
      return { score: 30, details: { quantifiableImpact: 0, businessOutcomes: 0, technicalAccomplishments: 0, topAchievements: [] } };
    }

    const quantRegex = /\d+%|\$[\d,.]+|\d+x|\d+ (users|customers|team|engineers|developers)/i;
    const bizKeywords = ['revenue', 'growth', 'profit', 'efficiency', 'cost reduction', 'user acquisition', 'retention', 'conversion', 'nps', 'satisfaction'];
    const techKeywords = ['scalability', 'performance', 'architecture', 'open source', 'patent', 'publication', 'system design', 'migration', 'microservices', 'refactored'];

    for (const ach of allAchievements) {
        let isQuant = false;
        let isBiz = false;
        let isTech = false;
        let points = 0;

        if (quantRegex.test(ach)) {
            quantScore += 15;
            isQuant = true;
            points += 3;
        }
        
        if (utils.containsAny(ach, bizKeywords)) {
            bizScore += 10;
            isBiz = true;
            points += 2;
        }

        if (utils.containsAny(ach, techKeywords)) {
            techScore += 10;
            isTech = true;
            points += 2;
        }

        if (points > 0) {
            topAchievements.push({ text: ach, points });
        }
    }

    quantScore = utils.clamp(quantScore, 0, 100);
    bizScore = utils.clamp(bizScore, 0, 100);
    techScore = utils.clamp(techScore, 0, 100);

    // Sort achievements by points
    topAchievements.sort((a, b) => b.points - a.points);
    const topN = topAchievements.slice(0, 3).map(a => a.text);

    const finalScore = (quantScore * 0.5) + (bizScore * 0.25) + (techScore * 0.25);

    return {
      score: Math.round(utils.clamp(finalScore, 0, 100)),
      details: {
        quantifiableImpact: Math.round(quantScore),
        businessOutcomes: Math.round(bizScore),
        technicalAccomplishments: Math.round(techScore),
        topAchievements: topN
      }
    };
  }
};
