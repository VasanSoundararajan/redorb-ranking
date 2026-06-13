window.Redrob = window.Redrob || {};

window.Redrob.CareerAnalysis = {
    evaluate(candidate) {
        let leadershipGrowthScore = 0;
        const clamp = window.Redrob.Utils.clamp;

        const exps = candidate.experience || [];
        if (exps.length === 0) return { leadershipGrowthScore: 0 };

        // 1. Promotion Path
        let currentSeniority = -1;
        let promotions = 0;
        const chronologicalExp = [...exps].reverse();
        
        chronologicalExp.forEach(exp => {
            const seniority = window.Redrob.Utils.getSeniorityIndex(exp.title || "");
            if (seniority > currentSeniority && currentSeniority !== -1) {
                promotions++;
            }
            if (seniority > currentSeniority) {
                currentSeniority = seniority;
            }
        });

        // 2. Leadership Growth (Keyword matching in descriptions)
        const leadershipKeywords = ['managed team', 'led team', 'mentored', 'built team', 'directed', 'supervised', 'hired'];
        let leadershipMatches = 0;

        // 3. Scope Expansion
        const scopeKeywords = ['program ownership', 'budget', 'cross functional', 'stakeholder', 'architecture', 'strategy', 'roadmap'];
        let scopeMatches = 0;

        // 4. Impact Expansion
        const impactKeywords = ['revenue', 'impact', 'growth', 'savings', 'optimized', 'reduced costs', 'increased'];
        let impactMatches = 0;

        exps.forEach(exp => {
            const desc = (exp.description || "").toLowerCase();
            const title = (exp.title || "").toLowerCase();
            
            if (leadershipKeywords.some(kw => desc.includes(kw) || title.includes(kw))) leadershipMatches++;
            if (scopeKeywords.some(kw => desc.includes(kw))) scopeMatches++;
            if (impactKeywords.some(kw => desc.includes(kw))) impactMatches++;
        });

        // Scoring Logic
        const promoScore = clamp(promotions * 20, 0, 30);
        const leadScore = clamp(leadershipMatches * 15, 0, 30);
        const scopeScore = clamp(scopeMatches * 10, 0, 20);
        const impactScore = clamp(impactMatches * 10, 0, 20);

        leadershipGrowthScore = promoScore + leadScore + scopeScore + impactScore;

        // Bonus for executive titles
        const topTitle = (exps[0] && exps[0].title || "").toLowerCase();
        if (topTitle.includes("director") || topTitle.includes("vp ") || topTitle.includes("head") || topTitle.includes("chief")) {
            leadershipGrowthScore += 20;
        }

        return {
            leadershipGrowthScore: clamp(leadershipGrowthScore, 0, 100)
        };
    }
};
