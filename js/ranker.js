window.Redrob = window.Redrob || {};

window.Redrob.Ranker = {
    rank(scoredCandidates) {
        // Sort descending by final_score
        const sorted = [...scoredCandidates].sort((a, b) => b.compositeResult.final_score - a.compositeResult.final_score);
        
        // Add rank and tier
        return sorted.map((item, index) => {
            const score = item.compositeResult.final_score;
            let tier = 'Poor Match';
            let tierColor = 'danger';
            
            if (score >= 80) {
                tier = 'Top Match';
                tierColor = 'success';
            } else if (score >= 60) {
                tier = 'Strong Match';
                tierColor = 'primary';
            } else if (score >= 40) {
                tier = 'Potential Match';
                tierColor = 'warning';
            }
            
            if (item.compositeResult.honeypot_risk_score > 30) {
                tier = 'High Risk';
                tierColor = 'danger';
            }
            
            return {
                candidate: item.candidate,
                compositeResult: item.compositeResult,
                rank: index + 1,
                tier: tier,
                tierColor: tierColor
            };
        });
    }
};
