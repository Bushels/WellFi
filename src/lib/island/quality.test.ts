import { describe, expect, it } from 'vitest';
import { tierFromSignals } from './quality';

describe('tierFromSignals', () => {
  it('desktop discrete-pointer with a real GPU is high tier', () => {
    expect(
      tierFromSignals({ coarsePointer: false, dpr: 1, renderer: 'NVIDIA GeForce RTX 3060' }),
    ).toBe('high');
  });
  it('coarse pointer (touch device) is low tier', () => {
    expect(
      tierFromSignals({ coarsePointer: true, dpr: 3, renderer: 'Apple GPU' }),
    ).toBe('low');
  });
  it('weak integrated/mobile GPU strings are low tier even with fine pointer', () => {
    expect(
      tierFromSignals({ coarsePointer: false, dpr: 1, renderer: 'Mali-G72' }),
    ).toBe('low');
    expect(
      tierFromSignals({ coarsePointer: false, dpr: 1, renderer: 'Intel(R) HD Graphics 4000' }),
    ).toBe('low');
  });
  it('unknown renderer string defaults to high on fine-pointer devices', () => {
    expect(tierFromSignals({ coarsePointer: false, dpr: 2, renderer: '' })).toBe('high');
  });
  it('ANGLE-wrapped discrete GPU strings (real Windows Chrome) are high tier', () => {
    expect(
      tierFromSignals({
        coarsePointer: false,
        dpr: 1,
        renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
      }),
    ).toBe('high');
  });
  it('Apple GPU on a fine-pointer Mac is high tier (coarse pointer was the gate, not the GPU)', () => {
    expect(
      tierFromSignals({ coarsePointer: false, dpr: 2, renderer: 'Apple M1' }),
    ).toBe('high');
  });
});
