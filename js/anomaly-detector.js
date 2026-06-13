window.Redrob = window.Redrob || {};

window.Redrob.AnomalyDetector = {
    detect(candidate) {
        let consistencyPoints = 100;
        let anomalyPoints = 0;
        let honeypotRisk = 0;
        const flags = [];

        // 1. Salary Check
        if (candidate.redrob_signals && candidate.redrob_signals.expected_salary_range_inr_lpa) {
            const range = candidate.redrob_signals.expected_salary_range_inr_lpa;
            if (range.min > range.max) {
                anomalyPoints += 20;
                consistencyPoints -= 20;
                honeypotRisk += 40;
                flags.push("Salary range inverted (min > max)");
            }
        }

        // 2. Timeline overlaps & Impossible durations
        if (candidate.experience && candidate.experience.length > 1) {
            let hasOverlap = false;
            for (let i = 0; i < candidate.experience.length - 1; i++) {
                const currentJob = candidate.experience[i];
                const prevJob = candidate.experience[i + 1]; // assuming ordered newest to oldest
                
                if (currentJob.start_date && prevJob.end_date) {
                    const start = new Date(currentJob.start_date);
                    const end = new Date(prevJob.end_date);
                    
                    if (start < end) {
                        const overlapMonths = (end - start) / (1000 * 60 * 60 * 24 * 30);
                        if (overlapMonths > 3) {
                            hasOverlap = true;
                        }
                    }
                }
            }
            if (hasOverlap) {
                anomalyPoints += 15;
                consistencyPoints -= 15;
                flags.push("Significant timeline overlaps detected");
            }
        }

        // 3. Education Timeline Check
        if (candidate.education && candidate.education.length > 0 && candidate.total_experience_years > 0) {
            // Find earliest graduation
            const earliestGradYear = Math.min(...candidate.education.map(e => e.year || e.end_year || 9999).filter(y => y !== 9999));
            const currentYear = new Date().getFullYear();
            const maxPossibleExp = currentYear - earliestGradYear + 4; // allow 4 years overlap with college
            
            if (candidate.total_experience_years > maxPossibleExp && earliestGradYear < 2020) {
                // Suspicious if claiming far more experience than time since earliest degree
                anomalyPoints += 30;
                consistencyPoints -= 30;
                honeypotRisk += 30;
                flags.push("Experience years exceed possible timeline since education");
            }
        }

        // 4. Role Consistency (Title vs Description mismatch)
        if (candidate.experience && candidate.experience.length > 0) {
            const recentExp = candidate.experience[0];
            const title = (recentExp.title || "").toLowerCase();
            const desc = (recentExp.description || "").toLowerCase();
            
            // Check for blatant mismatches
            if (title.includes("support") && (desc.includes("architect") || desc.includes("machine learning") || desc.includes("cloud"))) {
                anomalyPoints += 25;
                consistencyPoints -= 30;
                honeypotRisk += 50;
                flags.push("Role Contradiction: Support title but Architect/ML description");
            }
            if (title.includes("manager") && desc.includes("intern")) {
                anomalyPoints += 30;
                consistencyPoints -= 40;
                honeypotRisk += 60;
                flags.push("Role Contradiction: Leadership title with intern description");
            }
        }

        // 5. Advanced Honeypot Detection
        const rs = candidate.redrob_signals;
        if (rs) {
            // Behavioral Contradiction: High Github but Low Interview Completion
            const compRate = rs.interview_completion_rate !== undefined ? rs.interview_completion_rate : 1.0;
            if (rs.github_activity_score > 8 && compRate < 0.2) {
                anomalyPoints += 20;
                honeypotRisk += 40;
                flags.push("Behavioral Contradiction: Extremely high Github activity but very low interview completion");
            }
            
            // Skill Inflation & Assessment Mismatch
            if (candidate.skills && candidate.skills.length > 15) {
                const advancedSkills = candidate.skills.filter(s => s.level === 'advanced').length;
                
                if (rs.skill_assessment_scores) {
                    const avgScore = Object.values(rs.skill_assessment_scores).reduce((a,b) => a+b, 0) / Object.values(rs.skill_assessment_scores).length;
                    
                    if (advancedSkills > 8 && avgScore < 40) {
                        anomalyPoints += 30;
                        honeypotRisk += 50;
                        flags.push("Skill Inflation: Claimed many advanced skills but failed assessments");
                    }
                    
                    // Assessment Mismatch (e.g., failed specific skill tests)
                    const nlpSkills = candidate.skills.filter(s => s.name.toLowerCase().includes('nlp') || s.name.toLowerCase().includes('llm'));
                    if (nlpSkills.length > 0 && rs.skill_assessment_scores['nlp'] < 30) {
                         honeypotRisk += 30;
                         flags.push("Assessment Mismatch: Claimed advanced NLP skills but failed NLP assessment");
                    }
                } else if (advancedSkills > 15) {
                    // Claiming everything is advanced with no assessments is a mild flag
                    anomalyPoints += 10;
                    flags.push("Skill Inflation: High volume of unverified advanced skills");
                }
            }
            
            // Spam applicant pattern
            if (rs.applications_submitted_30d > 20 && rs.recruiter_response_rate < 0.1) {
                anomalyPoints += 10;
                consistencyPoints -= 10;
                flags.push("Spam applicant pattern detected");
            }
            
            // Unrealistic skill assessments
            if (rs.skill_assessment_scores) {
                const perfectScores = Object.values(rs.skill_assessment_scores).filter(s => s >= 98).length;
                if (perfectScores >= 4) {
                    anomalyPoints += 20;
                    honeypotRisk += 40;
                    flags.push("Suspiciously perfect skill assessments across multiple domains");
                }
            }
        }

        // Calculate final constrained scores
        const clamp = window.Redrob.Utils.clamp;
        
        return {
            consistency_score: clamp(consistencyPoints, 0, 100),
            anomaly_score: clamp(anomalyPoints, 0, 100),
            honeypot_risk_score: clamp(honeypotRisk, 0, 100),
            flags
        };
    }
};
