window.Redrob = window.Redrob || {};

window.Redrob.DynamicWeights = {
    generate(jobProfile) {
        // Base standard weights
        const weights = {
            technical: 0.30,
            behavioral: 0.15,
            career: 0.20,
            market: 0.10,
            ai_transition: 0.10,
            confidence: 0.05,
            interaction: 0.10,
            leadership: 0.0 // Default 0
        };

        const title = (jobProfile.title || "").toLowerCase();
        
        // Analyze for Leadership / Engineering Manager
        if (title.includes("manager") || title.includes("director") || title.includes("vp") || title.includes("head") || title.includes("lead")) {
            weights.leadership = 0.30;
            weights.career = 0.25;
            weights.behavioral = 0.20;
            weights.technical = 0.15;
            weights.confidence = 0.10;
            weights.ai_transition = 0.0;
            weights.market = 0.0;
            weights.interaction = 0.0;
        }
        
        // Analyze for AI/ML focus
        if (title.includes("ai") || title.includes("machine learning") || title.includes("ml ") || title.includes("data scientist")) {
            weights.technical = 0.35;
            weights.behavioral = 0.10;
            weights.ai_transition = 0.20;
            weights.career = 0.15;
            weights.confidence = 0.10;
            weights.market = 0.10;
            weights.interaction = 0.0;
            weights.leadership = 0.0;
        }

        return weights;
    }
};
