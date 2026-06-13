window.Redrob = window.Redrob || {};

window.Redrob.FeatureEngineering = {
    generate(candidate, jobProfile) {
        return {
            career: this._computeCareerFeatures(candidate),
            education: this._computeEducationFeatures(candidate, jobProfile)
        };
    },

    _computeCareerFeatures(candidate) {
        let promotionScore = 0;
        let tenureScore = 0;
        let careerGrowthScore = 0;

        const exps = candidate.experience || [];
        if (exps.length === 0) {
            return { promotion_score: 0, tenure_score: 0, career_growth_score: 0 };
        }

        // Tenure Score
        const totalMonths = candidate.total_experience_years * 12;
        const avgTenure = totalMonths / exps.length;
        if (avgTenure > 36) tenureScore = 100;
        else if (avgTenure > 24) tenureScore = 80;
        else if (avgTenure > 12) tenureScore = 50;
        else tenureScore = 20;

        // Promotion & Growth Score
        let promotions = 0;
        let currentSeniority = -1;
        
        // Reverse array to go from oldest to newest job
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

        promotionScore = window.Redrob.Utils.clamp(promotions * 25, 0, 100);
        
        // Overall Growth mixes tenure and promotions
        careerGrowthScore = Math.round((tenureScore * 0.4) + (promotionScore * 0.6));
        if (promotions === 0 && candidate.total_experience_years > 5) {
            careerGrowthScore -= 20; // Penalty for stagnation
        }

        return {
            promotion_score: window.Redrob.Utils.clamp(promotionScore, 0, 100),
            tenure_score: window.Redrob.Utils.clamp(tenureScore, 0, 100),
            career_growth_score: window.Redrob.Utils.clamp(careerGrowthScore, 0, 100)
        };
    },

    _computeEducationFeatures(candidate, jobProfile) {
        let degreeScore = 0;
        let institutionScore = 0;

        const edu = candidate.education || [];
        if (edu.length === 0) {
            return { degree_relevance_score: 0, institution_strength_score: 0 };
        }

        let bestDegreeLevel = 0;
        let isRelevant = false;

        edu.forEach(e => {
            const deg = (e.degree || "").toLowerCase();
            const field = (e.field || "").toLowerCase();
            
            // Tier parsing (tier_1, tier_2, etc.)
            if (e.tier === "tier_1") institutionScore = Math.max(institutionScore, 100);
            else if (e.tier === "tier_2") institutionScore = Math.max(institutionScore, 80);
            else if (e.tier === "tier_3") institutionScore = Math.max(institutionScore, 60);
            else institutionScore = Math.max(institutionScore, 40);

            let level = 0;
            if (deg.includes("phd") || deg.includes("ph.d") || deg.includes("doctorate")) level = 100;
            else if (deg.includes("master") || deg.includes("m.s") || deg.includes("m.e") || deg.includes("m.tech") || deg.includes("m.sc")) level = 80;
            else if (deg.includes("bachelor") || deg.includes("b.s") || deg.includes("b.e") || deg.includes("b.tech") || deg.includes("b.sc")) level = 60;
            
            bestDegreeLevel = Math.max(bestDegreeLevel, level);

            // Rough field relevance check (if job is tech, look for tech fields)
            const techFields = ["computer", "software", "machine learning", "data", "artificial intelligence", "it", "information"];
            if (techFields.some(t => field.includes(t))) {
                isRelevant = true;
            }
        });

        degreeScore = bestDegreeLevel;
        if (isRelevant) {
            degreeScore = Math.min(100, degreeScore + 20);
        } else if (bestDegreeLevel > 0) {
            degreeScore -= 20; // Penalty for irrelevant degree
        }

        return {
            degree_relevance_score: window.Redrob.Utils.clamp(degreeScore, 0, 100),
            institution_strength_score: window.Redrob.Utils.clamp(institutionScore, 0, 100)
        };
    }
};
