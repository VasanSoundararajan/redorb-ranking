self.window = self; // Shim for our scripts

importScripts(
    'utils.js',
    'candidate-normalizer.js',
    'scoring/skill-matcher.js',
    'anomaly-detector.js',
    'feature-engineering.js',
    'skill-clustering.js',
    'behavioral-intelligence.js',
    'dynamic-weights.js',
    'scoring/composite-scorer.js',
    'ranker.js'
);

self.onmessage = function(e) {
    const { candidates, jobProfile } = e.data;
    
    try {
        const normalized = self.Redrob.CandidateNormalizer.normalize(candidates);
        
        const total = normalized.length;
        const scoredCandidates = [];
        let processed = 0;
        const batchSize = 1000; // Chunk size
        
        function processBatch() {
            const batch = normalized.slice(processed, processed + batchSize);
            
            for(let i = 0; i < batch.length; i++) {
                const candidate = batch[i];
                const compositeResult = self.Redrob.CompositeScorer.calculate(candidate, jobProfile);
                scoredCandidates.push({ candidate, compositeResult });
            }
            
            processed += batch.length;
            
            self.postMessage({ type: 'progress', progress: Math.round((processed / total) * 100) });
            
            if (processed < total) {
                setTimeout(processBatch, 0);
            } else {
                const ranked = self.Redrob.Ranker.rank(scoredCandidates);
                self.postMessage({ type: 'complete', ranked });
            }
        }
        
        processBatch();
        
    } catch (err) {
        self.postMessage({ type: 'error', message: err.toString() });
    }
};
