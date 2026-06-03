import { LifeState, Action, AuditDelta } from '../types.js';
import { applyDeltas } from '../utils.js';
import { Asset } from '../types.js';

const RISK_PROFILE = {
  ETF:    { baseReturn: 0.007, volatility: 0.02, stressOnLoss: 5 },
  STOCK:  { baseReturn: 0.012, volatility: 0.06, stressOnLoss: 10 },
  CRYPTO: { baseReturn: 0.02,  volatility: 0.15, stressOnLoss: 20 },
};

export function applyInvest(state: LifeState, action: Extract<Action, { type: 'INVEST' }>): AuditDelta[] {
  const { instrument, amount, risk } = action;

  if (amount > state.finance.cash) {
    // Kognitive Verzerrung: zu risikoreich bei hohem Optimismus-Bias
    const deltas = applyDeltas(state, [
      { path: 'vitals.stress', delta: 5, clamp: [0, 100], reason: 'INVEST_insufficient_funds' },
    ]);
    return deltas;
  }

  const profile = RISK_PROFILE[instrument];

  // Loss aversion: buying an overvalued asset feels worse when price drops
  const lossAversionMultiplier = state.person.cognitiveProfile.lossAversion;

  const asset: Asset = {
    id: `${instrument.toLowerCase()}_${state.meta.tick}`,
    type: instrument.toLowerCase() as Asset['type'],
    value: amount,
    purchaseTick: state.meta.tick,
    purchasePrice: amount,
  };

  state.finance.assets.push(asset);

  const stressDelta = risk * profile.stressOnLoss * 0.3; // buying feels somewhat stressful
  const prideDelta = risk < 0.3 ? 2 : 5; // aggressive investors feel proud

  return applyDeltas(state, [
    { path: 'finance.cash', delta: -amount, reason: `INVEST(${instrument},${amount}€)` },
    {
      path: 'vitals.stress',
      delta: stressDelta * lossAversionMultiplier,
      clamp: [0, 100],
      reason: `INVEST_risk_anxiety`,
    },
    { path: 'emotions.pride', delta: prideDelta, clamp: [0, 100], reason: 'INVEST_action' },
  ]);
}
