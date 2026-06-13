window.Redrob = window.Redrob || {};

window.Redrob.SkillClustering = {
    DOMAINS: {
        genai: ['llm', 'lora', 'fine-tuning', 'transformers', 'prompt engineering', 'rag', 'vector database', 'milvus', 'langchain', 'openai', 'huggingface', 'nlp', 'generative ai', 'gans', 'diffusion'],
        ml: ['classification', 'regression', 'xgboost', 'feature engineering', 'model evaluation', 'machine learning', 'scikit-learn', 'tensorflow', 'pytorch', 'deep learning', 'computer vision', 'random forest', 'predictive modeling'],
        data_engineering: ['spark', 'kafka', 'airflow', 'snowflake', 'databricks', 'hadoop', 'etl', 'data warehouse', 'bigquery', 'redshift', 'apache beam', 'flink', 'sql'],
        mlops: ['kubeflow', 'mlflow', 'weights & biases', 'docker', 'kubernetes', 'model deployment', 'ci/cd', 'terraform', 'bentoml', 'ray', 'triton'],
        cloud: ['aws', 'azure', 'gcp', 'amazon web services', 'google cloud', 'ec2', 's3', 'lambda']
    },

    analyze(candidate) {
        const skills = candidate.skills || [];
        const domainScores = {
            genai_score: 0,
            ml_score: 0,
            data_engineering_score: 0,
            mlops_score: 0,
            cloud_score: 0
        };

        const flatSkills = skills.map(s => s.name.toLowerCase());

        // Helper to score a domain
        const scoreDomain = (domainKeywords) => {
            let matchCount = 0;
            let proficiencyBonus = 0;
            
            skills.forEach(skill => {
                const sName = skill.name.toLowerCase();
                if (domainKeywords.some(kw => sName.includes(kw))) {
                    matchCount++;
                    if (skill.level === 'advanced') proficiencyBonus += 5;
                    else if (skill.level === 'intermediate') proficiencyBonus += 3;
                    if (skill.years > 3) proficiencyBonus += 5;
                }
            });

            // Base score: 1 match = ~40, 3 matches = ~80, 5+ = 100
            let score = (matchCount * 20) + proficiencyBonus;
            return window.Redrob.Utils.clamp(score, 0, 100);
        };

        domainScores.genai_score = scoreDomain(this.DOMAINS.genai);
        domainScores.ml_score = scoreDomain(this.DOMAINS.ml);
        domainScores.data_engineering_score = scoreDomain(this.DOMAINS.data_engineering);
        domainScores.mlops_score = scoreDomain(this.DOMAINS.mlops);
        domainScores.cloud_score = scoreDomain(this.DOMAINS.cloud);

        // AI Transition Readiness Detection
        let aiTransitionReadiness = 0;
        const totalAiScore = domainScores.genai_score + domainScores.ml_score;
        const title = (candidate.title || "").toLowerCase();
        
        const hasAiTitle = title.includes("ai ") || title.includes("machine learning") || title.includes("data scientist") || title.includes("ml ");
        
        // If they do NOT have an AI title, but have strong AI/ML skills -> high transition readiness
        if (!hasAiTitle) {
            if (totalAiScore > 100) {
                // High transition potential
                aiTransitionReadiness = 90;
                // Boost if they are coming from a strong adjecent field like Data Eng or Backend
                if (domainScores.data_engineering_score > 60 || title.includes("backend") || title.includes("software")) {
                    aiTransitionReadiness = 100;
                }
            } else if (totalAiScore > 50) {
                aiTransitionReadiness = 60;
            } else if (totalAiScore > 20) {
                aiTransitionReadiness = 30;
            }
        } else {
            // Already in AI, readiness is moot but technically 100% ready
            aiTransitionReadiness = 100; 
        }

        return {
            ...domainScores,
            ai_transition_readiness_score: aiTransitionReadiness
        };
    }
};
