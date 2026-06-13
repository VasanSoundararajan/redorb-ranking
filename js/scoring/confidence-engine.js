window.Redrob = window.Redrob || {};

window.Redrob.ConfidenceEngine = {
    evaluate(candidate, anomalyData) {
        const clamp = window.Redrob.Utils.clamp;
        let profileCompleteness = 50;
        let verificationStatus = 0;
        let assessmentCoverage = 0;
        let consistency = anomalyData ? anomalyData.consistency_score : 50;
        let behavioralStability = 50;

        if (candidate.redrob_signals) {
            const rs = candidate.redrob_signals;
            
            // Profile Completeness
            if (rs.profile_completeness_score !== undefined) {
                profileCompleteness = rs.profile_completeness_score;
            }

            // Verification Status
            let verifications = 0;
            if (rs.verified_email) verifications++;
            if (rs.verified_phone) verifications++;
            if (rs.linkedin_connected) verifications++;
            if (verifications === 3) verificationStatus = 100;
            else if (verifications === 2) verificationStatus = 70;
            else if (verifications === 1) verificationStatus = 30;

            // Assessment Coverage
            if (rs.skill_assessment_scores && Object.keys(rs.skill_assessment_scores).length > 0) {
                assessmentCoverage = 100;
            }

            // Behavioral Stability
            const responseRate = rs.recruiter_response_rate !== undefined ? rs.recruiter_response_rate : 0.5;
            const completionRate = rs.interview_completion_rate !== undefined ? rs.interview_completion_rate : 0.5;
            const hasActivity = (rs.applications_submitted_30d || rs.saved_by_recruiters_30d) ? 100 : 50;
            
            behavioralStability = (responseRate * 100 * 0.4) + (completionRate * 100 * 0.4) + (hasActivity * 0.2);
        }

        // Final Confidence Formula
        const confidenceScore = (
            (profileCompleteness * 0.2) +
            (verificationStatus * 0.2) +
            (assessmentCoverage * 0.1) +
            (consistency * 0.3) +
            (behavioralStability * 0.2)
        );

        return {
            profileCompleteness,
            verificationStatus,
            assessmentCoverage,
            consistency,
            behavioralStability,
            confidenceScore: clamp(Math.round(confidenceScore), 0, 100)
        };
    }
};
