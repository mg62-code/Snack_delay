import { Rule } from './types.js';
import { thresholdRules } from './threshold.js';
import { rateRules } from './rate.js';
import { scheduledRules } from './scheduled.js';
import { careerRules } from './career.js';
import { socialRules } from './social.js';

export const ALL_RULES: Rule[] = [
  ...scheduledRules,
  ...thresholdRules,
  ...careerRules,
  ...socialRules,
  ...rateRules,
].sort((a, b) => b.priority - a.priority);

export { thresholdRules, rateRules, scheduledRules, careerRules, socialRules };
export type { Rule, RuleResult, RuleDelta } from './types.js';
