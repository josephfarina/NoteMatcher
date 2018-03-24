import notes, { INDEX_MAP_BY_NOTE } from '../pitch/notes';

enum Step {
  half = 1,
  whole = 2
}

function generateScale(note: Note, steps: Step[]): (Note | undefined)[] {
  const scale: (Note | undefined)[] = [note];
  let lastNoteIndex = INDEX_MAP_BY_NOTE[note];
  steps.forEach(step => {
    lastNoteIndex -= step;
    const nextNote = notes[lastNoteIndex];

    if (typeof nextNote === 'undefined') {
      scale.push(undefined);
    } else {
      scale.push(notes[lastNoteIndex].note);
    }
  });

  return scale;
}

export function getMajorScale(note: Note) {
  return generateScale(note, [
    Step.whole,
    Step.whole,
    Step.half,
    Step.whole,
    Step.whole,
    Step.whole,
    Step.half
  ]);
}

export function getMinorScale(note: Note) {
  return generateScale(note, [
    Step.whole,
    Step.half,
    Step.whole,
    Step.whole,
    Step.half,
    Step.whole,
    Step.whole
  ]);
}

export function buildMidiFromScale(
  scale: (Note | undefined)[],
  options: {
    beatsPerNote: number;
  } = {
    beatsPerNote: 2
  }
): MidiNote[] {
  const { beatsPerNote } = options;
  return scale.reduce((acc: MidiNote[], note) => {
    if (typeof note !== 'undefined') {
      const nextNote: MidiNote = [note, beatsPerNote];
      const undefineds = [];
      for (let i = 1; i < beatsPerNote; i++) undefineds.push(undefined);

      return [...acc, nextNote, ...undefineds];
    }

    return acc;
  }, []);
}
