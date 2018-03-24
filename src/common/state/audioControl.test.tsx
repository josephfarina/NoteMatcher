import * as audioControl from './audioControl';

function makeStateRoot(state: Partial<StateAudioControl>): StateRoot {
  return {
    audioControl: {
      tempo: 120,
      signature: [4, 4],
      measures: 4,
      ...state
    }
  } as StateRoot;
}

describe('audioControl', () => {
  describe('midi', () => {
    it('should not allow two midi notes in the same beat', () => {
      const dispatch = jasmine.createSpy('dispatch');
      const getState = jasmine.createSpy('getState');

      const test = (
        current: MidiNote[],
        expected: MidiNote[],
        note: Note,
        start: number,
        end: number
      ) => {
        // add a note when no others exist
        getState.and.returnValue(makeStateRoot({ midi: current }));
        audioControl.addMidiNote(note, start, end)(dispatch, getState);
        const actualState: MidiNote[] = dispatch.calls.mostRecent().args[0]
          .payload;
        expect(expected).toEqual(actualState);
      };

      test([], [['F3', 4]], 'F3', 0, 4);

      // add a note when one before exists but no overlap
      test([['G4', 4]], [['G4', 4], , , , ['F3', 4]], 'F3', 4, 4);

      // add a note when before and after exist but no overlap
      test(
        [['G4', 4], , , , , , ['F3', 4]],
        [['G4', 4], , , , ['A3', 2], , ['F3', 4]],
        'A3',
        4,
        2
      );

      // delete note of it completely overlaps it
      test(
        [, ['G4', 4]],
        [['F3', 6], undefined], // need to add an undefined for jasminee
        'F3',
        0,
        6
      );

      // delete note of they are identical
      test([, ['G4', 4]], [, ['F3', 4]], 'F3', 1, 4);
      test([, ['G4', 4]], [, ['F3', 6]], 'F3', 1, 6);

      // override a note before it
      test([['G4', 4]], [['G4', 2], , ['F3', 4]], 'F3', 2, 4);
      test([['G4', 4]], [['G4', 3], , , ['F3', 4]], 'F3', 3, 4);
      // even if the new note's end isnt as long as original note
      test([['G4', 4]], [['G4', 1], ['F3', 2]], 'F3', 1, 2);
      // if it is offset from the start
      test([, ['G4', 6]], [, ['G4', 2], , ['F3', 2]], 'F3', 3, 2);

      // Test dragging to cut of the next notes
      test(
        [, , ['G4', 4]],
        [['F3', 6], undefined, undefined], // undefineds for jasmine length checking
        'F3',
        0,
        6
      );

      test([, , ['G4', 4]], [['F3', 3], , , ['G4', 3]], 'F3', 0, 3);

      test([, , ['G4', 4]], [['F3', 4], , , , ['G4', 2]], 'F3', 0, 4);
      test([, , ['G4', 4]], [['F3', 5], , , , , ['G4', 1]], 'F3', 0, 5);

      test([, , ['G4', 4]], [['F3', 6], , ,], 'F3', 0, 6);

      // TODO: test that it cant be dragged outside the current number of
      // beats;
    });
  });
});
