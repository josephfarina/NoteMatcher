import notes from './notes';

export default function findClosestNote(freq: number) {
  // Use binary search to find the closest note
  let low = notes.length;
  let high = -1;

  while (low - high > 1) {
    let pivot = Math.round((low + high) / 2);
    if (notes[pivot].frequency <= freq) {
      low = pivot;
    } else {
      high = pivot;
    }
  }

  if (!notes[high] || !notes[low]) return null;

  if (
    Math.abs(notes[high].frequency - freq) <=
    Math.abs(notes[low].frequency - freq)
  ) {
    // notes[high] is closer to the frequency we found
    return notes[high];
  }

  return notes[low];
}
