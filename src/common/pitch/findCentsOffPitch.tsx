export default function findCentsOffPitch(freq: number, refFreq: number) {
  // We need to find how far freq is from baseFreq in cents
  const log2 = 0.6931471805599453; // Math.log(2)
  const multiplicativeFactor = freq / refFreq;
  // We use Math.floor to get the integer part and ignore decimals
  const cents = Math.floor(1200 * (Math.log(multiplicativeFactor) / log2));
  return cents;
}
