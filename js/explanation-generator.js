window.Redrob = window.Redrob || {};

window.Redrob.ExplanationGenerator = {
    generate(candidate, compositeResult, jobProfile, rank, tier) {
        let skillsText = "";
        if (candidate.skills && candidate.skills.length > 0) {
            // Get top 3 advanced skills, else just top 3
            let topSkills = candidate.skills.filter(s => s.level === 'advanced').slice(0, 3).map(s => s.name);
            if (topSkills.length === 0) {
                topSkills = candidate.skills.slice(0, 3).map(s => s.name);
            }
            skillsText = `Strong ${topSkills.join(', ')} experience `;
        } else {
            skillsText = `Solid technical foundation `;
        }

        let careerText = "";
        if (compositeResult.leadership_growth > 50) {
            careerText = `with demonstrable leadership growth and increasing scope. `;
        } else {
            careerText = `with consistent career progression. `;
        }

        let behaviorText = "";
        const arch = compositeResult._dashboardData.archetype;
        if (arch === "Passive High-Value") {
            behaviorText = `Demonstrates high passive recruiter interest. `;
        } else if (arch === "High Demand Candidate") {
            behaviorText = `Currently in extremely high market demand. `;
        } else if (arch === "Active Job Seeker") {
            behaviorText = `Highly active and responsive in the market. `;
        }

        let aiText = "";
        if (compositeResult.ai_transition_readiness > 70) {
            aiText = `Shows exceptional AI transition potential through strong foundation skills. `;
        }

        let warningText = "";
        if (compositeResult.honeypot_risk_score > 30) {
            warningText = `WARNING: Profile flagged for ${compositeResult._dashboardData.flags[0]}.`;
        }

        const fullExplanation = (skillsText + careerText + behaviorText + aiText + warningText).trim();
        return fullExplanation;
    }
};
