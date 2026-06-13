window.Redrob = window.Redrob || {};

window.Redrob.BehavioralIntelligence = {
    analyze(candidate) {
        const rs = candidate.redrob_signals || {};
        const clamp = window.Redrob.Utils.clamp;

        // 1. Responsiveness Score
        const responseRate = rs.recruiter_response_rate !== undefined ? rs.recruiter_response_rate : 0.5;
        const responseTimeHrs = rs.avg_response_time_hours !== undefined ? rs.avg_response_time_hours : 72;
        // Fast response < 24h is good. Slow response > 100h is bad.
        let timeScore = 100 - ((responseTimeHrs / 168) * 100); // 168 = 1 week
        const responsivenessScore = clamp((responseRate * 100 * 0.6) + (timeScore * 0.4), 0, 100);

        // 2. Recruitability Score
        let openToWorkBonus = rs.open_to_work_flag ? 20 : 0;
        let noticePeriodScore = 50;
        if (rs.notice_period_days !== undefined) {
            if (rs.notice_period_days <= 15) noticePeriodScore = 100;
            else if (rs.notice_period_days <= 30) noticePeriodScore = 80;
            else if (rs.notice_period_days <= 60) noticePeriodScore = 50;
            else noticePeriodScore = 20; // e.g. 90+ days in India is common but lowers recruitability
        }
        let offerRateScore = 50;
        if (rs.offer_acceptance_rate && rs.offer_acceptance_rate > 0) {
            offerRateScore = rs.offer_acceptance_rate * 100;
        }
        const recruitabilityScore = clamp(openToWorkBonus + (noticePeriodScore * 0.5) + (offerRateScore * 0.5), 0, 100);

        // 3. Market Demand Score
        const views = rs.profile_views_received_30d || 0;
        const search = rs.search_appearance_30d || 0;
        const saves = rs.saved_by_recruiters_30d || 0;
        // Baseline: ~100 searches, ~10 views, ~2 saves is average
        const viewScore = Math.min(views / 20 * 100, 100);
        const searchScore = Math.min(search / 150 * 100, 100);
        const saveScore = Math.min(saves / 5 * 100, 100);
        const marketDemandScore = clamp((viewScore * 0.2) + (searchScore * 0.3) + (saveScore * 0.5), 0, 100);

        // 4. Reliability Score
        const completionRate = rs.interview_completion_rate !== undefined ? rs.interview_completion_rate : 0.5;
        let verificationBonus = 0;
        if (rs.verified_email) verificationBonus += 10;
        if (rs.verified_phone) verificationBonus += 15;
        const reliabilityScore = clamp((completionRate * 100 * 0.75) + verificationBonus, 0, 100);

        // 5. Engagement Score
        const apps = rs.applications_submitted_30d || 0;
        const appScore = Math.min(apps / 10 * 100, 100);
        const engagementScore = clamp((appScore * 0.4) + (responseRate * 100 * 0.4) + (viewScore * 0.2), 0, 100);

        // 6. Mobility Score
        let mobilityScore = 50;
        if (rs.willing_to_relocate) mobilityScore += 30;
        if (rs.preferred_work_mode === 'remote' || rs.preferred_work_mode === 'flexible') mobilityScore += 20;
        mobilityScore = clamp(mobilityScore, 0, 100);

        // Signal Interaction Modeling (Thought Tree 7)
        let archetype = "Standard Profile";
        let interactionScore = 50; // Base score
        
        // High Demand Candidate / Strong Market Signal
        if (marketDemandScore > 75 && completionRate > 0.6) {
            archetype = "High Demand Candidate";
            interactionScore += 30;
        }
        // Passive High-Value Candidate
        else if (appScore < 20 && marketDemandScore > 60 && responseRate > 0.4) {
            archetype = "Passive High-Value";
            interactionScore += 40;
        }
        // Active Job Seeker
        else if (appScore > 60 && rs.open_to_work_flag && timeScore > 70) {
            archetype = "Active Job Seeker";
            interactionScore += 10;
        }
        // High-Risk Candidate
        else if (completionRate < 0.4 || (responseRate < 0.2 && apps > 10)) {
            archetype = "High-Risk Candidate";
            interactionScore -= 30;
        }

        interactionScore = clamp(interactionScore, 0, 100);

        // Behavioral Fit
        let fitScore = (responsivenessScore * 0.2) + (recruitabilityScore * 0.3) + (reliabilityScore * 0.5);
        
        return {
            responsiveness_score: Math.round(responsivenessScore),
            recruitability_score: Math.round(recruitabilityScore),
            market_demand_score: Math.round(marketDemandScore),
            reliability_score: Math.round(reliabilityScore),
            engagement_score: Math.round(engagementScore),
            mobility_score: Math.round(mobilityScore),
            interaction_score: Math.round(interactionScore),
            behavioral_fit_score: clamp(Math.round(fitScore), 0, 100),
            archetype
        };
    }
};
