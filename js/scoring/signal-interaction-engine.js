window.Redrob = window.Redrob || {};

window.Redrob.SignalInteractionEngine = {
    evaluate(candidate) {
        const rs = candidate.redrob_signals || {};
        const clamp = window.Redrob.Utils.clamp;

        // Base metrics
        const searchApp = rs.search_appearance_30d || 0;
        const saves = rs.saved_by_recruiters_30d || 0;
        const completionRate = rs.interview_completion_rate !== undefined ? rs.interview_completion_rate : 0.5;
        const applications = rs.applications_submitted_30d || 0;
        const responseRate = rs.recruiter_response_rate !== undefined ? rs.recruiter_response_rate : 0.5;
        const openToWork = !!rs.open_to_work_flag;
        const responseTimeHrs = rs.avg_response_time_hours !== undefined ? rs.avg_response_time_hours : 72;

        // Scores
        let marketSignalScore = 0;
        let passiveTalentScore = 0;
        let activeCandidateScore = 0;
        let riskInteractionScore = 0;

        // 1. Strong Market Signal
        if (searchApp > 50 && saves > 2 && completionRate > 0.6) {
            marketSignalScore = 100;
        } else if (searchApp > 20 && saves > 0) {
            marketSignalScore = 50;
        }

        // 2. Passive High-Value Candidate
        if (applications < 5 && saves > 1 && responseRate > 0.6) {
            passiveTalentScore = 100;
        } else if (applications < 15 && saves > 0 && responseRate > 0.4) {
            passiveTalentScore = 50;
        }

        // 3. Active Job Seeker
        if (openToWork && applications > 10 && responseTimeHrs < 48) {
            activeCandidateScore = 100;
        } else if (openToWork || applications > 5) {
            activeCandidateScore = 50;
        }

        // 4. Risk Candidate
        if (applications > 30 && responseRate < 0.2 && completionRate < 0.4) {
            riskInteractionScore = 100;
        } else if (applications > 15 && (responseRate < 0.4 || completionRate < 0.5)) {
            riskInteractionScore = 50;
        }

        // Final interaction score combination
        let base = 50;
        if (marketSignalScore === 100) base += 30;
        else if (marketSignalScore === 50) base += 10;
        
        if (passiveTalentScore === 100) base += 30;
        else if (passiveTalentScore === 50) base += 15;
        
        if (activeCandidateScore === 100) base += 15;
        else if (activeCandidateScore === 50) base += 5;
        
        if (riskInteractionScore === 100) base -= 40;
        else if (riskInteractionScore === 50) base -= 20;

        return {
            marketSignalScore,
            passiveTalentScore,
            activeCandidateScore,
            riskInteractionScore,
            interactionScore: clamp(base, 0, 100)
        };
    }
};
