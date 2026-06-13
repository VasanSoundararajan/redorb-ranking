window.Redrob = window.Redrob || {};

window.Redrob.AITransitionEngine = {
    evaluate(candidate) {
        let score = 0;
        const skills = (candidate.skills || []).map(s => s.name.toLowerCase());
        const exps = candidate.experience || [];
        const combinedText = [
            candidate.title || "",
            candidate.summary || "",
            ...exps.map(e => e.title + " " + e.description)
        ].join(" ").toLowerCase();

        // If they already have an AI title, readiness is 100
        const isAlreadyAI = ["ai ", "machine learning", "data scientist", "ml "].some(kw => (candidate.title || "").toLowerCase().includes(kw));
        if (isAlreadyAI) {
            return 100;
        }

        // 1. Current Role Proximity (Max 25)
        const proximityRoles = ['data engineer', 'backend engineer', 'analytics engineer', 'platform engineer', 'software engineer', 'data analyst'];
        const title = (candidate.title || "").toLowerCase();
        let proximityScore = 0;
        if (proximityRoles.some(r => title.includes(r))) {
            proximityScore = 25;
        } else if (title.includes("developer") || title.includes("programmer")) {
            proximityScore = 15;
        }

        // 2. Technical Foundation (Max 25)
        const techKeywords = ['python', 'sql', 'spark', 'kafka', 'airflow', 'cloud', 'docker', 'kubernetes', 'aws', 'gcp', 'azure'];
        let techMatches = skills.filter(s => techKeywords.includes(s)).length;
        techKeywords.forEach(kw => {
            if (combinedText.includes(kw) && !skills.includes(kw)) techMatches++;
        });
        const techScore = Math.min(techMatches * 5, 25);

        // 3. Machine Learning Foundation (Max 25)
        const mlKeywords = ['classification', 'regression', 'feature engineering', 'model evaluation', 'xgboost', 'ml pipelines', 'scikit', 'pandas', 'tensorflow', 'pytorch'];
        let mlMatches = skills.filter(s => mlKeywords.some(kw => s.includes(kw))).length;
        mlKeywords.forEach(kw => {
            if (combinedText.includes(kw) && !skills.some(s => s.includes(kw))) mlMatches++;
        });
        const mlScore = Math.min(mlMatches * 6, 25);

        // 4. Generative AI Exposure (Max 15)
        const genaiKeywords = ['llm', 'llms', 'prompt engineering', 'lora', 'fine-tuning', 'fine tuning', 'rag', 'transformers', 'vector database', 'milvus', 'langchain', 'openai'];
        let genaiMatches = skills.filter(s => genaiKeywords.some(kw => s.includes(kw))).length;
        genaiKeywords.forEach(kw => {
            if (combinedText.includes(kw) && !skills.some(s => s.includes(kw))) genaiMatches++;
        });
        const genaiScore = Math.min(genaiMatches * 7.5, 15);

        // 5. Proof of Learning (Max 10)
        let learningScore = 0;
        if (candidate.redrob_signals && candidate.redrob_signals.github_activity_score > 5) learningScore += 5;
        if (combinedText.includes("kaggle") || combinedText.includes("competition") || combinedText.includes("open source") || combinedText.includes("hackathon") || combinedText.includes("research")) {
            learningScore += 5;
        }

        score = proximityScore + techScore + mlScore + genaiScore + learningScore;
        
        return window.Redrob.Utils.clamp(Math.round(score), 0, 100);
    }
};
