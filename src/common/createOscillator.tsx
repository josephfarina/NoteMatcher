const real = [0, 0.4, 0.4, 1, 1, 1, 0.3, 0.7, 0.6, 0.5, 0.9, 0.8];
const imag = real.map(() => 0);

export default function createOscillator(ctx: AudioContext): OscillatorNode {
  const oscillator = ctx.createOscillator();
  oscillator.setPeriodicWave(
    ctx.createPeriodicWave(Float32Array.from(real), Float32Array.from(imag))
  );
  return oscillator;
}
