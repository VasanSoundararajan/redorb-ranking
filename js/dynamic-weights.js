window.Redrob = window.Redrob || {};

window.Redrob.DynamicWeights = {
    generate(jobProfile) {
        // Base standard weights (matches Evidence Fusion Layer base formula)
        const weights = {
            technicalFit: 0.25,
            behavioralFit: 0.15,
            careerFit: 0.15,
            aiTransitionScore: 0.10,
            interactionScore: 0.10,
            confidenceScore: 0.15,
            leadershipGrowthScore: 0.10
        };

        const title = (jobProfile.title || "").toLowerCase();
        
        // Analyze for Leadership / Engineering Manager
        if (title.includes("manager") || title.includes("director") || title.includes("vp") || title.includes("head") || title.includes("lead")) {
            weights.leadershipGrowthScore = 0.25;
            weights.careerFit = 0.20;
            weights.behavioralFit = 0.20;
            weights.technicalFit = 0.15;
            weights.confidenceScore = 0.10;
            weights.aiTransitionScore = 0.05;
            weights.interactionScore = 0.05;
        }
        
        // Analyze for AI/ML focus
        if (title.includes("ai") || title.includes("machine learning") || title.includes("ml ") || title.includes("data scientist")) {
            weights.technicalFit = 0.35;
            weights.aiTransitionScore = 0.20;
            weights.behavioralFit = 0.10;
            weights.careerFit = 0.10;
            weights.confidenceScore = 0.10;
            weights.interactionScore = 0.10;
            weights.leadershipGrowthScore = 0.05;
        }

        return weights;
    }
};
