const MIN_SAMPLES = 4; // corresponds to an 11kHz signal
const MAX_SAMPLES = 1000; // corresponds to a 44Hz signal
const SIZE = 1000;

export default function autoCorrelate(buf: Uint8Array, sampleRate: number) {
  let best_offset = -1;
  let best_correlation = 0;
  let rms = 0;
  let foundGoodCorrelation = false;

  if (buf.length < SIZE + MAX_SAMPLES - MIN_SAMPLES) {
    return -1; // Not enough data
  }

  for (let i = 0; i < SIZE; i++) {
    let val = (buf[i] - 128) / 128;
    rms += val * val;
  }

  rms = Math.sqrt(rms / SIZE);

  if (rms < 0.01) {
    return -1;
  }

  let lastCorrelation = 1;
  for (let offset = MIN_SAMPLES; offset <= MAX_SAMPLES; offset++) {
    let correlation = 0;

    for (let i = 0; i < SIZE; i++) {
      correlation += Math.abs(
        (buf[i] - 128) / 128 - (buf[i + offset] - 128) / 128
      );
    }

    correlation = 1 - correlation / SIZE;
    if (correlation > 0.9 && correlation > lastCorrelation) {
      foundGoodCorrelation = true;
    } else if (foundGoodCorrelation) {
      // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
      return sampleRate / best_offset;
    }

    lastCorrelation = correlation;
    if (correlation > best_correlation) {
      best_correlation = correlation;
      best_offset = offset;
    }
  }

  if (best_correlation > 0.01) {
    // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
    return sampleRate / best_offset;
  }

  return -1;
  //  let best_frequency = sampleRate/best_offset;
}

// https://github.com/peterkhayes/pitchfinder/blob/master/src/detectors/yin.js
export function YIN(buf: Uint8Array, sampleRate: number): number {
  const DEFAULT_THRESHOLD = 0.1;
  const DEFAULT_PROBABILITY_THRESHOLD = 0.1;

  const threshold = DEFAULT_THRESHOLD;
  const probabilityThreshold = DEFAULT_PROBABILITY_THRESHOLD;

  // Set buffer size to the highest power of two below the provided buffer's length.
  let bufferSize;
  for (bufferSize = 1; bufferSize < buf.length; bufferSize *= 2);
  bufferSize /= 2;

  // Set up the yinBuffer as described in step one of the YIN paper.
  const yinBufferLength = bufferSize / 2;
  const yinBuffer = new Float32Array(yinBufferLength);

  let probability = 0;
  let tau;

  // Compute the difference function as described in step 2 of the YIN paper.
  for (let t = 0; t < yinBufferLength; t++) {
    yinBuffer[t] = 0;
  }
  for (let t = 1; t < yinBufferLength; t++) {
    for (let i = 0; i < yinBufferLength; i++) {
      const delta = buf[i] - buf[i + t];
      yinBuffer[t] += delta * delta;
    }
  }

  // Compute the cumulative mean normalized difference as described in step 3 of the paper.
  yinBuffer[0] = 1;
  yinBuffer[1] = 1;
  let runningSum = 0;
  for (let t = 1; t < yinBufferLength; t++) {
    runningSum += yinBuffer[t];
    yinBuffer[t] *= t / runningSum;
  }

  // Compute the absolute threshold as described in step 4 of the paper.
  // Since the first two positions in the array are 1,
  // we can start at the third position.
  for (tau = 2; tau < yinBufferLength; tau++) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      // found tau, exit loop and return
      // store the probability
      // From the YIN paper: The threshold determines the list of
      // candidates admitted to the set, and can be interpreted as the
      // proportion of aperiodic power tolerated
      // within a periodic signal.
      //
      // Since we want the periodicity and and not aperiodicity:
      // periodicity = 1 - aperiodicity
      probability = 1 - yinBuffer[tau];
      break;
    }
  }

  // if no pitch found, return null.
  if (tau === yinBufferLength || yinBuffer[tau] >= threshold) {
    return -1;
  }

  // If probability too low, return -1.
  if (probability < probabilityThreshold) {
    return -1;
  }

  /**
   * Implements step 5 of the AUBIO_YIN paper. It refines the estimated tau
   * value using parabolic interpolation. This is needed to detect higher
   * frequencies more precisely. See http://fizyka.umk.pl/nrbook/c10-2.pdf and
   * for more background
   * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
   */
  let betterTau, x0, x2;
  if (tau < 1) {
    x0 = tau;
  } else {
    x0 = tau - 1;
  }
  if (tau + 1 < yinBufferLength) {
    x2 = tau + 1;
  } else {
    x2 = tau;
  }
  if (x0 === tau) {
    if (yinBuffer[tau] <= yinBuffer[x2]) {
      betterTau = tau;
    } else {
      betterTau = x2;
    }
  } else if (x2 === tau) {
    if (yinBuffer[tau] <= yinBuffer[x0]) {
      betterTau = tau;
    } else {
      betterTau = x0;
    }
  } else {
    const s0 = yinBuffer[x0];
    const s1 = yinBuffer[tau];
    const s2 = yinBuffer[x2];
    // fixed AUBIO implementation, thanks to Karl Helgason:
    // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
    betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  }

  return sampleRate / betterTau;
}
