import { LifeState, Action, AuditDelta } from '../types.js';
import { applyWork } from './work.js';
import { applySleep } from './sleep.js';
import { applyLearn } from './learn.js';
import { applyExercise } from './exercise.js';
import { applySocialize } from './socialize.js';
import { applyJobChange } from './job-change.js';
import { applyInvest } from './invest.js';
import { applyRest } from './rest.js';
import { applyEat } from './eat.js';
import { applyMeditate } from './meditate.js';

export function applyAction(state: LifeState, action: Action): AuditDelta[] {
  switch (action.type) {
    case 'WORK':      return applyWork(state, action);
    case 'SLEEP':     return applySleep(state, action);
    case 'LEARN':     return applyLearn(state, action);
    case 'EXERCISE':  return applyExercise(state, action);
    case 'SOCIALIZE': return applySocialize(state, action);
    case 'JOB_CHANGE':return applyJobChange(state, action);
    case 'INVEST':    return applyInvest(state, action);
    case 'REST':      return applyRest(state, action);
    case 'EAT':       return applyEat(state, action);
    case 'MEDITATE':  return applyMeditate(state, action);
  }
}
