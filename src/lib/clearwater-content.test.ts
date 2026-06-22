import { describe, expect, it } from 'vitest';
import { clearwater } from './content';

describe('clearwater content', () => {
  it('has exactly six benefits in the locked descent order', () => {
    expect(clearwater.benefits.map((b) => b.label)).toEqual([
      'Extend Pump Life',
      'Increase Production',
      'Drawdown Management',
      'Reservoir Monitoring',
      'Water Cut Tracking',
      'Well Optimization',
    ]);
  });

  it('every benefit has a non-empty supporting line', () => {
    for (const b of clearwater.benefits) {
      expect(b.detail.length).toBeGreaterThan(0);
    }
  });

  it('uses the relocated reveal tagline', () => {
    expect(clearwater.revealTagline).toBe('Data Below, Insight Above');
  });
});
