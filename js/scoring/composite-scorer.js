window.Redrob = window.Redrob || {};

window.Redrob.CompositeScorer = {
    calculate(candidate, jobProfile) {
        // 1. Core Analyzers
        const anomaly = window.Redrob.AnomalyDetector.detect(candidate);
        const features = window.Redrob.FeatureEngineering.generate(candidate, jobProfile);
        const skills = window.Redrob.SkillClustering.analyze(candidate);
        const behavior = window.Redrob.BehavioralIntelligence.analyze(candidate);
        const dynamicWeights = window.Redrob.DynamicWeights.generate(jobProfile);

        // Technical Fit
        const skillMatch = window.Redrob.SkillMatcher ? window.Redrob.SkillMatcher.score(candidate, jobProfile).score : 50;
        let technicalFit = skillMatch;
        if ((jobProfile.title || "").toLowerCase().includes("ai ") || (jobProfile.title || "").toLowerCase().includes("ml ")) {
            technicalFit = (skillMatch * 0.4) + (skills.genai_score * 0.3) + (skills.ml_score * 0.3);
        }

        // Career Fit
        const careerFit = (features.career.career_growth_score * 0.6) + (features.education.degree_relevance_score * 0.4);

        // Confidence Engine (Thought Tree 8)
        let profileCompleteness = 50;
        let assessmentCoverage = 0;
        let verificationStatus = 0;
        let signalCompleteness = 50;
        
        if (candidate.redrob_signals) {
            profileCompleteness = candidate.redrob_signals.profile_completeness_score || 50;
            if (candidate.redrob_signals.skill_assessment_scores && Object.keys(candidate.redrob_signals.skill_assessment_scores).length > 0) {
                assessmentCoverage = 100;
            }
            if (candidate.redrob_signals.verified_email && candidate.redrob_signals.verified_phone) {
                verificationStatus = 100;
            } else if (candidate.redrob_signals.verified_email || candidate.redrob_signals.verified_phone) {
                verificationStatus = 50;
            }
            if (candidate.redrob_signals.interview_completion_rate !== undefined) {
                signalCompleteness = 100;
            }
        }
        
        const confidenceScore = (profileCompleteness * 0.2) + (signalCompleteness * 0.2) + (assessmentCoverage * 0.1) + (anomaly.consistency_score * 0.3) + (verificationStatus * 0.2);

        // 3. Apply Dynamic Weights for Base Final Score
        let finalScore = 
            (technicalFit * dynamicWeights.technical) +
            (behavior.behavioral_fit_score * dynamicWeights.behavioral) +
            (careerFit * dynamicWeights.career) +
            (behavior.market_demand_score * dynamicWeights.market) +
            (skills.ai_transition_readiness_score * dynamicWeights.ai_transition) +
            (confidenceScore * dynamicWeights.confidence) +
            (behavior.interaction_score * dynamicWeights.interaction);
            
        // Leadership specific
        if (dynamicWeights.leadership > 0) {
             let leadershipScore = 50;
             if (candidate.redrob_signals && candidate.redrob_signals.leadership) leadershipScore = candidate.redrob_signals.leadership;
             finalScore += (leadershipScore * dynamicWeights.leadership);
        }

        // 4. Apply Penalties
        finalScore -= anomaly.anomaly_score * 0.5;
        finalScore -= anomaly.honeypot_risk_score; // heavy penalty for honeypots

        finalScore = window.Redrob.Utils.clamp(Math.round(finalScore), 0, 100);

        // 5. Generate Reasoning (Recruiter-friendly 1-2 sentence summary)
        let reasoning = `${candidate.name} is a ${behavior.archetype} with a ${Math.round(technicalFit)}/100 technical fit and a ${Math.round(careerFit)}/100 career trajectory. `;
        if (anomaly.honeypot_risk_score > 30) {
            reasoning += `WARNING: Severe anomalies detected (${anomaly.flags[0]}). `;
        } else if (skills.ai_transition_readiness_score > 80) {
            reasoning += "Displays extremely strong readiness for an AI transition. ";
        }

        // 6. Return exact JSON schema requested
        return {
            candidate_id: candidate.candidate_id,
            technical_fit: Math.round(technicalFit),
            career_fit: Math.round(careerFit),
            behavioral_fit: behavior.behavioral_fit_score,
            market_demand: behavior.market_demand_score,
            ai_transition_readiness: skills.ai_transition_readiness_score,
            confidence_score: Math.round(confidenceScore),
            interaction_score: behavior.interaction_score,
            risk_score: anomaly.anomaly_score,
            honeypot_risk_score: anomaly.honeypot_risk_score,
            final_score: finalScore,
            reasoning: reasoning.trim(),
            
            // Additional internal payload for the UI dashboard (not exported in final JSON array)
            _dashboardData: {
                flags: anomaly.flags,
                archetype: behavior.archetype
            }
        };
    }
};
