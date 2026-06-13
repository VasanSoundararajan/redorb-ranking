/**
 * Redrob Recruiter-Facing Explanation Generator
 *
 * Produces concise, human-readable summaries (1-2 sentences) that
 * highlight a candidate's strongest skills, relevant experience, and
 * key differentiators — without exposing any internal scoring details.
 *
 * Attach point: window.Redrob.ExplanationGenerator
 *
 * @namespace Redrob.ExplanationGenerator
 */
window.Redrob = window.Redrob || {};

(function (ns) {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Internal helpers                                                  */
  /* ------------------------------------------------------------------ */

  /**
   * Safely retrieve a nested value, returning `defaultVal` when the path
   * is missing or the leaf is `undefined`.
   *
   * @param {Object} obj
   * @param {string} path  - Dot-delimited property path.
   * @param {*}      defaultVal
   * @returns {*}
   */
  function safeGet(obj, path, defaultVal) {
    if (obj == null) return defaultVal;
    var keys = path.split('.');
    var cur = obj;
    for (var i = 0; i < keys.length; i++) {
      if (cur == null || typeof cur !== 'object') return defaultVal;
      cur = cur[keys[i]];
    }
    return cur === undefined ? defaultVal : cur;
  }

  /**
   * Pick the top N matching skills from the compositeResult breakdown.
   *
   * Preference order:
   *   1. matched_required skills (these matter most to the role)
   *   2. matched_preferred skills
   *
   * @param {Object} compositeResult
   * @param {number} [limit=3]
   * @returns {string[]}
   */
  function pickTopSkills(compositeResult, limit) {
    limit = limit || 3;
    var required  = safeGet(compositeResult, 'breakdown.skills.details.matched_required', []);
    var preferred = safeGet(compositeResult, 'breakdown.skills.details.matched_preferred', []);

    if (!Array.isArray(required))  required  = [];
    if (!Array.isArray(preferred)) preferred = [];

    var combined = [];
    var seen = {};
    var sources = [required, preferred];

    for (var s = 0; s < sources.length; s++) {
      for (var i = 0; i < sources[s].length; i++) {
        var skill = String(sources[s][i]).trim();
        if (skill && !seen[skill.toLowerCase()]) {
          seen[skill.toLowerCase()] = true;
          combined.push(skill);
          if (combined.length >= limit) return combined;
        }
      }
    }

    return combined;
  }

  /**
   * Build a concise experience highlight string.
   *
   * @param {Object} compositeResult
   * @param {Object} jobProfile
   * @returns {string} e.g. "7 years of relevant experience in fintech"
   */
  function buildExperienceHighlight(compositeResult, jobProfile) {
    var totalYears    = safeGet(compositeResult, 'breakdown.experience.details.total_years', null);
    var relevantYears = safeGet(compositeResult, 'breakdown.experience.details.relevant_years', null);
    var domainMatch   = safeGet(compositeResult, 'breakdown.experience.details.domain_match', false);
    var industry      = safeGet(jobProfile, 'industry', '');

    if (relevantYears != null && relevantYears > 0) {
      var base = relevantYears + ' year' + (relevantYears !== 1 ? 's' : '') + ' of relevant experience';
      if (domainMatch && industry) {
        base += ' in ' + industry;
      }
      return base;
    }

    if (totalYears != null && totalYears > 0) {
      return totalYears + ' year' + (totalYears !== 1 ? 's' : '') + ' of professional experience';
    }

    return '';
  }

  /**
   * Determine the candidate's key differentiator.
   *
   * Priority:
   *   1. Quantified achievements from the achievement breakdown
   *   2. High behavioral score (≥ 75)
   *   3. Strong domain match with extensive experience
   *
   * @param {Object} compositeResult
   * @param {Object} jobProfile
   * @returns {string} A single-sentence differentiator or empty string.
   */
  function determineDifferentiator(compositeResult, jobProfile) {
    // 1. Quantified achievements
    var achievements = safeGet(compositeResult, 'breakdown.achievement.details.quantified_achievements', []);
    if (Array.isArray(achievements) && achievements.length > 0) {
      // Pick the first (presumably most impactful) achievement
      var top = String(achievements[0]).trim();
      if (top) {
        return 'Key differentiator: ' + top;
      }
    }

    // 2. High behavioral signals
    var behavioralScore = safeGet(compositeResult, 'breakdown.behavioral.score', 0);
    if (typeof behavioralScore === 'number' && behavioralScore >= 75) {
      return 'Behavioral signals suggest strong leadership and collaboration potential.';
    }

    // 3. Strong domain match
    var domainMatch = safeGet(compositeResult, 'breakdown.experience.details.domain_match', false);
    var relevantYears = safeGet(compositeResult, 'breakdown.experience.details.relevant_years', 0);
    if (domainMatch && relevantYears >= 5) {
      var industry = safeGet(jobProfile, 'industry', 'the target domain');
      return 'Deep domain expertise in ' + industry + ' strengthens overall fit.';
    }

    return '';
  }

  /**
   * Check whether any risk flag matches a given type.
   *
   * @param {Array<{type: string, severity: string, detail: string}>} riskFlags
   * @param {string} flagType
   * @returns {boolean}
   */
  function hasRiskType(riskFlags, flagType) {
    if (!Array.isArray(riskFlags)) return false;
    for (var i = 0; i < riskFlags.length; i++) {
      if (riskFlags[i] && riskFlags[i].type === flagType) return true;
    }
    return false;
  }

  /**
   * Check whether any risk flag has `severity === 'critical'`.
   *
   * @param {Array<{type: string, severity: string, detail: string}>} riskFlags
   * @returns {boolean}
   */
  function hasCriticalRisk(riskFlags) {
    if (!Array.isArray(riskFlags)) return false;
    for (var i = 0; i < riskFlags.length; i++) {
      if (riskFlags[i] && riskFlags[i].severity === 'critical') return true;
    }
    return false;
  }

  /**
   * Build a risk-warning prefix for flagged candidates.
   *
   * @param {Array<{type: string, severity: string, detail: string}>} riskFlags
   * @returns {string} Warning string or empty string if no actionable flags.
   */
  function buildRiskWarning(riskFlags) {
    if (!Array.isArray(riskFlags) || riskFlags.length === 0) return '';

    if (hasRiskType(riskFlags, 'honeypot')) {
      return '\u26A0\uFE0F Profile flagged for review: Inconsistencies detected in career timeline and unrealistic skill claims relative to experience duration.';
    }

    if (hasRiskType(riskFlags, 'keyword_stuffing')) {
      return '\u26A0\uFE0F Profile appears heavily optimized — skill claims may not reflect practical proficiency. Manual verification recommended.';
    }

    // Generic critical risk
    if (hasCriticalRisk(riskFlags)) {
      return '\u26A0\uFE0F Profile flagged for review due to potential credibility concerns.';
    }

    return '';
  }

  /**
   * Select and populate a template based on the candidate's tier.
   *
   * @param {string}   tier
   * @param {string[]} topSkills
   * @param {string}   experienceHighlight
   * @param {string}   differentiator
   * @param {Object}   jobProfile
   * @param {Object}   compositeResult
   * @returns {string}
   */
  function selectTemplate(tier, topSkills, experienceHighlight, differentiator, jobProfile, compositeResult) {
    var skillsStr = topSkills.length > 0 ? topSkills.join(', ') : '';
    var title = safeGet(jobProfile, 'title', 'the role') || 'the role';
    var seniority = safeGet(jobProfile, 'seniority', '');

    // Build a role descriptor for more natural phrasing
    var roleDescriptor = seniority ? seniority + ' ' + title : title;

    switch (tier) {
      case 'Top Match':
        return buildTopMatchExplanation(skillsStr, experienceHighlight, differentiator, roleDescriptor);

      case 'Strong Match':
        return buildStrongMatchExplanation(skillsStr, experienceHighlight, differentiator, roleDescriptor, compositeResult);

      case 'Moderate Match':
        return buildModerateMatchExplanation(skillsStr, experienceHighlight, differentiator, roleDescriptor, compositeResult);

      case 'Weak Match':
      default:
        return buildWeakMatchExplanation(skillsStr, experienceHighlight, roleDescriptor, compositeResult);
    }
  }

  /**
   * @param {string} skillsStr
   * @param {string} experienceHighlight
   * @param {string} differentiator
   * @param {string} roleDescriptor
   * @returns {string}
   */
  function buildTopMatchExplanation(skillsStr, experienceHighlight, differentiator, roleDescriptor) {
    var parts = [];

    var opener = 'Excellent fit for ' + roleDescriptor;
    if (skillsStr && experienceHighlight) {
      opener += ' with strong ' + skillsStr + ' expertise and ' + experienceHighlight + '.';
    } else if (skillsStr) {
      opener += ' with strong ' + skillsStr + ' expertise.';
    } else if (experienceHighlight) {
      opener += ' with ' + experienceHighlight + '.';
    } else {
      opener += '.';
    }
    parts.push(opener);

    if (differentiator) {
      parts.push(differentiator);
    }

    return parts.join(' ');
  }

  /**
   * @param {string} skillsStr
   * @param {string} experienceHighlight
   * @param {string} differentiator
   * @param {string} roleDescriptor
   * @param {Object} compositeResult
   * @returns {string}
   */
  function buildStrongMatchExplanation(skillsStr, experienceHighlight, differentiator, roleDescriptor, compositeResult) {
    var parts = [];

    var opener = 'Strong candidate for ' + roleDescriptor;
    if (skillsStr && experienceHighlight) {
      opener += ' combining ' + skillsStr + ' skills with ' + experienceHighlight + '.';
    } else if (skillsStr) {
      opener += ' with demonstrated ' + skillsStr + ' capabilities.';
    } else if (experienceHighlight) {
      opener += ' backed by ' + experienceHighlight + '.';
    } else {
      opener += '.';
    }
    parts.push(opener);

    if (differentiator) {
      parts.push(differentiator);
    } else {
      // Fallback: mention behavioral signals if noteworthy
      var behavioralScore = safeGet(compositeResult, 'breakdown.behavioral.score', 0);
      if (typeof behavioralScore === 'number' && behavioralScore >= 60) {
        parts.push('Behavioral signals suggest strong adaptability and learning potential.');
      }
    }

    return parts.join(' ');
  }

  /**
   * @param {string} skillsStr
   * @param {string} experienceHighlight
   * @param {string} differentiator
   * @param {string} roleDescriptor
   * @param {Object} compositeResult
   * @returns {string}
   */
  function buildModerateMatchExplanation(skillsStr, experienceHighlight, differentiator, roleDescriptor, compositeResult) {
    var parts = [];

    // Identify gaps to mention diplomatically
    var missingCritical = safeGet(compositeResult, 'breakdown.skills.details.missing_critical', []);
    if (!Array.isArray(missingCritical)) missingCritical = [];

    if (skillsStr && experienceHighlight) {
      parts.push('Solid ' + skillsStr + ' background with ' + experienceHighlight + '.');
    } else if (skillsStr) {
      parts.push('Shows competency in ' + skillsStr + '.');
    } else if (experienceHighlight) {
      parts.push('Brings ' + experienceHighlight + '.');
    } else {
      parts.push('Partial alignment with ' + roleDescriptor + ' requirements.');
    }

    if (missingCritical.length > 0) {
      var gapStr = missingCritical.slice(0, 2).join(' and ');
      parts.push('Limited ' + gapStr + ' experience creates a gap for this role, though ' +
        (differentiator ? differentiator.toLowerCase() : 'potential for growth exists.'));
    } else if (differentiator) {
      parts.push(differentiator);
    }

    return parts.join(' ');
  }

  /**
   * @param {string} skillsStr
   * @param {string} experienceHighlight
   * @param {string} roleDescriptor
   * @param {Object} compositeResult
   * @returns {string}
   */
  function buildWeakMatchExplanation(skillsStr, experienceHighlight, roleDescriptor, compositeResult) {
    var missingCritical = safeGet(compositeResult, 'breakdown.skills.details.missing_critical', []);
    if (!Array.isArray(missingCritical)) missingCritical = [];

    if (missingCritical.length > 0) {
      var gapStr = missingCritical.slice(0, 3).join(', ');
      var base = 'Significant gaps in ' + gapStr + ' limit fit for ' + roleDescriptor + '.';
      if (skillsStr) {
        base += ' Some relevant background in ' + skillsStr + ' noted.';
      }
      return base;
    }

    if (skillsStr || experienceHighlight) {
      return 'Limited overall alignment with ' + roleDescriptor + ' requirements.' +
        (experienceHighlight ? ' Brings ' + experienceHighlight + ' but key skill gaps remain.' : '');
    }

    return 'Does not meet the core requirements for ' + roleDescriptor + ' at this time.';
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                        */
  /* ------------------------------------------------------------------ */

  /**
   * Generate a recruiter-facing explanation for a ranked candidate.
   *
   * The explanation is 1-2 sentences of professional, non-technical
   * language that highlights the candidate's strongest matching skills,
   * relevant experience, and key differentiator. Risk-flagged
   * candidates receive a diplomatic warning prefix.
   *
   * @param {Object} candidate        - The candidate data object.
   * @param {Object} compositeResult  - Scoring result with `finalScore`,
   *   `breakdown`, `riskFlags`, and `adjustments`.
   * @param {Object} jobProfile       - Job specification with `title`,
   *   `required_skills`, `preferred_skills`, `min_experience`,
   *   `max_experience`, `seniority`, and `industry`.
   * @param {number} rank             - The candidate's rank position (1-based).
   * @param {string} tier             - The assigned tier label
   *   (`'Top Match'`, `'Strong Match'`, `'Moderate Match'`, or `'Weak Match'`).
   * @returns {string} A concise, recruiter-friendly explanation string.
   *
   * @example
   * var explanation = Redrob.ExplanationGenerator.generate(
   *   { name: 'Alice' },
   *   {
   *     finalScore: 88,
   *     breakdown: {
   *       skills: { score: 90, weight: 0.3, weightedScore: 27,
   *         details: { matched_required: ['React', 'Node.js'], matched_preferred: ['TypeScript'], missing_critical: [] } },
   *       experience: { score: 85, weight: 0.25, weightedScore: 21.25,
   *         details: { total_years: 8, relevant_years: 7, domain_match: true } },
   *       behavioral: { score: 80, weight: 0.15, weightedScore: 12 },
   *       education: { score: 70, weight: 0.1, weightedScore: 7 },
   *       achievement: { score: 92, weight: 0.2, weightedScore: 18.4,
   *         details: { quantified_achievements: ['Led migration serving 2M users'], quality_score: 90 } }
   *     },
   *     riskFlags: [],
   *     adjustments: []
   *   },
   *   { title: 'Full-Stack Engineer', required_skills: ['React', 'Node.js'],
   *     preferred_skills: ['TypeScript'], min_experience: 5, max_experience: 10,
   *     seniority: 'Senior', industry: 'fintech' },
   *   1,
   *   'Top Match'
   * );
   * // => "Excellent fit for Senior Full-Stack Engineer with strong React, Node.js, TypeScript
   * //     expertise and 7 years of relevant experience in fintech. Key differentiator:
   * //     Led migration serving 2M users"
   */
  function generate(candidate, compositeResult, jobProfile, rank, tier) {
    // Normalise inputs
    compositeResult = compositeResult || {};
    jobProfile      = jobProfile      || {};
    tier            = tier            || 'Weak Match';

    var riskFlags = Array.isArray(compositeResult.riskFlags) ? compositeResult.riskFlags : [];

    // ---- Risk-warning path (takes priority) ----
    var riskWarning = buildRiskWarning(riskFlags);
    if (riskWarning) {
      // For risk-flagged candidates we still provide a brief context sentence
      var topSkills = pickTopSkills(compositeResult, 2);
      var expHighlight = buildExperienceHighlight(compositeResult, jobProfile);

      var context = '';
      if (topSkills.length > 0 || expHighlight) {
        context = ' Listed skills include ' + (topSkills.length > 0 ? topSkills.join(', ') : 'general competencies');
        if (expHighlight) {
          context += ' with ' + expHighlight;
        }
        context += '.';
      }

      return riskWarning + context;
    }

    // ---- Standard explanation path ----
    var topSkills      = pickTopSkills(compositeResult, 3);
    var expHighlight   = buildExperienceHighlight(compositeResult, jobProfile);
    var differentiator = determineDifferentiator(compositeResult, jobProfile);

    return selectTemplate(tier, topSkills, expHighlight, differentiator, jobProfile, compositeResult);
  }

  /* ------------------------------------------------------------------ */
  /*  Namespace export                                                  */
  /* ------------------------------------------------------------------ */

  ns.ExplanationGenerator = {
    generate: generate
  };

})(window.Redrob);
