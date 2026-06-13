window.Redrob = window.Redrob || {};

window.Redrob.Utils = {
  normalize(str) {
    if (!str) return '';
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  },
  
  stringSimilarity(s1, s2) {
    if (!s1 || !s2) return 0;
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    
    // Simple edit distance approximation for demo purposes
    if (longer.includes(shorter)) return 0.8;
    
    const intersection = new Set([...longer].filter(x => new Set(shorter).has(x)));
    return intersection.size / longer.length;
  },
  
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },
  
  lerp(a, b, t) {
    return a + (b - a) * t;
  },
  
  yearsBetween(startDate, endDate) {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    return Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 365.25));
  },
  
  extractNumbers(str) {
    if (!str) return [];
    const matches = str.match(/\d+([.,]\d+)?/g);
    return matches ? matches.map(Number) : [];
  },
  
  containsAny(str, keywords) {
    if (!str || !keywords || !keywords.length) return false;
    const normalizedStr = this.normalize(str);
    return keywords.some(kw => normalizedStr.includes(this.normalize(kw)));
  },
  
  SKILL_SYNONYMS: {
    'javascript': ['js', 'ecmascript', 'es6', 'es2015'],
    'typescript': ['ts'],
    'react': ['reactjs', 'react.js'],
    'node.js': ['node', 'nodejs'],
    'python': ['py'],
    'postgresql': ['postgres', 'psql'],
    'amazon web services': ['aws'],
    'google cloud platform': ['gcp'],
    'machine learning': ['ml'],
    'artificial intelligence': ['ai']
  },

  SKILL_CLUSTERS: {
    'frontend': ['javascript', 'typescript', 'react', 'angular', 'vue', 'html', 'css'],
    'backend': ['node.js', 'python', 'java', 'go', 'ruby', 'c#', 'php'],
    'database': ['postgresql', 'mysql', 'mongodb', 'redis', 'sql', 'nosql'],
    'cloud': ['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform']
  },

  getCanonicalSkill(skillName) {
    if (!skillName) return '';
    const norm = this.normalize(skillName);
    
    for (const [canonical, synonyms] of Object.entries(this.SKILL_SYNONYMS)) {
      if (norm === canonical || synonyms.includes(norm)) {
        return canonical;
      }
    }
    return norm;
  },
  
  areSkillsRelated(skill1, skill2) {
    const s1 = this.getCanonicalSkill(skill1);
    const s2 = this.getCanonicalSkill(skill2);
    
    if (s1 === s2) return true;
    
    for (const cluster of Object.values(this.SKILL_CLUSTERS)) {
      if (cluster.includes(s1) && cluster.includes(s2)) {
        return true;
      }
    }
    return false;
  },
  
  SENIORITY_LEVELS: ['intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c-level'],
  
  getSeniorityIndex(title) {
    if (!title) return -1;
    const normTitle = this.normalize(title);
    
    // Check from highest to lowest
    if (this.containsAny(normTitle, ['chief', 'c-level', 'ceo', 'cto', 'cfo', 'coo'])) return 8;
    if (this.containsAny(normTitle, ['vp', 'vice president'])) return 7;
    if (this.containsAny(normTitle, ['director', 'head of'])) return 6;
    if (this.containsAny(normTitle, ['manager', 'managing'])) return 5;
    if (this.containsAny(normTitle, ['lead', 'principal', 'staff', 'architect'])) return 4;
    if (this.containsAny(normTitle, ['senior', 'sr', 'sr.'])) return 3;
    if (this.containsAny(normTitle, ['mid', 'associate'])) return 2;
    if (this.containsAny(normTitle, ['junior', 'jr', 'entry'])) return 1;
    if (this.containsAny(normTitle, ['intern', 'trainee'])) return 0;
    
    return 2; // Default to mid if not specified
  },
  
  getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'poor';
  }
};
