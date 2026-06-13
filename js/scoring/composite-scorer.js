window.Redrob = window.Redrob || {};

window.Redrob.CompositeScorer = {
    calculate(candidate, jobProfile) {
        // 1. Core Analyzers
        const anomaly = window.Redrob.AnomalyDetector.detect(candidate);
        const features = window.Redrob.FeatureEngineering.generate(candidate, jobProfile);
        const skills = window.Redrob.SkillClustering.analyze(candidate);
        const dynamicWeights = window.Redrob.DynamicWeights.generate(jobProfile);

        // 2. New Intelligence Engines
        const aiTransition = window.Redrob.AITransitionEngine.evaluate(candidate);
        const interaction = window.Redrob.SignalInteractionEngine.evaluate(candidate);
        const confidence = window.Redrob.ConfidenceEngine.evaluate(candidate, anomaly);
        const careerAnalysis = window.Redrob.CareerAnalysis.evaluate(candidate);
        const behavior = window.Redrob.BehavioralIntelligence.analyze(candidate);

        // 3. Technical Fit
        const skillMatch = window.Redrob.SkillMatcher ? window.Redrob.SkillMatcher.score(candidate, jobProfile).score : 50;
        let technicalFit = skillMatch;
        if ((jobProfile.title || "").toLowerCase().includes("ai ") || (jobProfile.title || "").toLowerCase().includes("ml ")) {
            technicalFit = (skillMatch * 0.4) + (skills.genai_score * 0.3) + (skills.ml_score * 0.3);
        }

        // 4. Career Fit
        const careerFit = (features.career.career_growth_score * 0.6) + (features.education.degree_relevance_score * 0.4);

        // 5. Evidence Fusion Formula (Applying dynamic weights generated from JD)
        let finalScore = 
            (technicalFit * dynamicWeights.technicalFit) +
            (behavior.behavioral_fit_score * dynamicWeights.behavioralFit) +
            (careerFit * dynamicWeights.careerFit) +
            (aiTransition * dynamicWeights.aiTransitionScore) +
            (interaction.interactionScore * dynamicWeights.interactionScore) +
            (confidence.confidenceScore * dynamicWeights.confidenceScore) +
            (careerAnalysis.leadershipGrowthScore * dynamicWeights.leadershipGrowthScore);

        // 6. Apply Risk Penalties
        finalScore -= anomaly.anomaly_score;
        finalScore -= anomaly.honeypot_risk_score;

        finalScore = window.Redrob.Utils.clamp(Math.round(finalScore), 0, 100);

        // 7. Generate Reasoning Output
        // The reasoning logic is moved to app.js using the new Enhanced Explanation format, but we keep a fallback here
        const reasoning = `Scored ${finalScore}/100 based on technical and behavioral evaluation.`;

        return {
            candidate_id: candidate.candidate_id,
            technical_fit: Math.round(technicalFit),
            career_fit: Math.round(careerFit),
            behavioral_fit: behavior.behavioral_fit_score,
            market_demand: behavior.market_demand_score,
            ai_transition_readiness: aiTransition,
            confidence_score: confidence.confidenceScore,
            interaction_score: interaction.interactionScore,
            leadership_growth: careerAnalysis.leadershipGrowthScore,
            risk_score: anomaly.anomaly_score,
            honeypot_risk_score: anomaly.honeypot_risk_score,
            final_score: finalScore,
            reasoning: reasoning, // will be overwritten in UI step
            
            // Internal payload for Dashboard UI
            _dashboardData: {
                flags: anomaly.flags,
                archetype: behavior.archetype,
                behavioral: behavior,
                skills: {
                    matched: skills.matched_skills || [],
                    missing: skills.missing_skills || []
                }
            }
        };
    }
};
