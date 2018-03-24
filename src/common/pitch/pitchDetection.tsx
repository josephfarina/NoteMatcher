import findClosestNote from "./findClosestNote";
import findCentsOffPitch from "./findCentsOffPitch";
import { YIN } from "./autoCorrelate";

export default function pitchDetection(
  context: AudioContext,
  analyser: AnalyserNode
): {
  note: Note;
  frequency: number;
  cents: number;
} | null {
  const buffer = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(buffer);
  const frequency = YIN(buffer, context.sampleRate);
  const note = findClosestNote(frequency);

  if (frequency !== -1 && note) {
    const cents = findCentsOffPitch(frequency, note.frequency);
    return {
      frequency,
      cents,
      note: note.note
    };
  }

  return null;
}
