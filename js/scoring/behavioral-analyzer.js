window.Redrob = window.Redrob || {};

window.Redrob.BehavioralAnalyzer = {
  score(candidate, jobProfile) {
    const utils = window.Redrob.Utils;
    
    const signals = candidate.behavioral_signals || {};
    const keys = Object.keys(signals);
    
    if (keys.length === 0) {
      return { 
        score: 50, 
        details: { 
            reliability: 50, adaptability: 50, communication: 50, 
            leadership: 50, learningAbility: 50, consistency: 50, 
            signalStrength: 0, patterns: ['No behavioral data provided'] 
        } 
      };
    }

    const rel = signals.reliability || 50;
    const adapt = signals.adaptability || 50;
    const comm = signals.communication || 50;
    const lead = signals.leadership || 50;
    const learn = signals.learning_ability || 50;
    const cons = signals.consistency || 50;
    const collab = signals.collaboration || 50;
    
    const patterns = [];
    let bonus = 0;

    // High performance pattern
    if (rel > 75 && adapt > 75 && comm > 75 && learn > 75 && collab > 75) {
        patterns.push('Consistent High Performer');
        bonus += 15;
    }

    // Leadership potential
    if (lead > 80 && comm > 80) {
        patterns.push('Strong Leadership Indicators');
        bonus += 10;
    }

    // Growth potential
    if (adapt > 80 && learn > 80) {
        patterns.push('High Growth Potential');
        bonus += 10;
    }
    
    // Suspicious pattern check (handled more in risk-detector, but we flag it here too)
    const values = [rel, adapt, comm, lead, learn, cons, collab];
    const allSame = values.every(v => v === values[0]);
    if (allSame) {
        patterns.push('Suspiciously Uniform Signals');
        bonus -= 20; // Penalty
    }

    // Match against job expectations
    const expected = jobProfile.behavioral_expectations || {};
    let matchedScore = 0;
    let weightSum = 0;

    const weights = {
        reliability: expected.reliability || 1,
        adaptability: expected.adaptability || 1,
        communication: expected.communication || 1,
        leadership: (jobProfile.leadership_required ? 2 : 1),
        learning_ability: 1.5,
        consistency: 1,
        collaboration: 1.5
    };

    matchedScore += rel * weights.reliability; weightSum += weights.reliability;
    matchedScore += adapt * weights.adaptability; weightSum += weights.adaptability;
    matchedScore += comm * weights.communication; weightSum += weights.communication;
    matchedScore += lead * weights.leadership; weightSum += weights.leadership;
    matchedScore += learn * weights.learning_ability; weightSum += weights.learning_ability;
    matchedScore += cons * weights.consistency; weightSum += weights.consistency;
    matchedScore += collab * weights.collaboration; weightSum += weights.collaboration;

    let finalScore = (matchedScore / weightSum) + bonus;

    return {
      score: Math.round(utils.clamp(finalScore, 0, 100)),
      details: {
        reliability: rel,
        adaptability: adapt,
        communication: comm,
        leadership: lead,
        learningAbility: learn,
        consistency: cons,
        signalStrength: 100,
        patterns
      }
    };
  }
};
