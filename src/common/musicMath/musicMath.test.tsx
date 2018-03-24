import { getMajorScale, getMinorScale, buildMidiFromScale } from './';

describe('musicMath', () => {
  describe('#getMajorScale', () => {
    it('should return eight notes', () => {
      const res = getMajorScale('C2');
      expect(res.length).toEqual(8);
    });

    it('first and last note should be octaves', () => {
      const res = getMajorScale('C2');
      expect(res[0]).toEqual('C2');
      expect(res[res.length - 1]).toEqual('C3');
    });

    it('should return the proper scale', () => {
      const scales: (Note | undefined)[][] = [
        ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'],
        ['D2', 'E2', 'F#2', 'G2', 'A2', 'B2', 'C#3', 'D3'],
        ['E4', 'F#4', 'G#4', 'A4', 'B4', 'C#5', 'D#5', 'E5'],
        ['B3', 'C#4', 'D#4', 'E4', 'F#4', 'G#4', 'A#4', 'B4'],
        ['F#4', 'G#4', 'A#4', 'B4', 'C#5', 'D#5', 'F5', 'F#5'],
        ['G#2', 'A#2', 'C3', 'C#3', 'D#3', 'F3', 'G3', 'G#3'],

        // TODO: should this return undefined or build back downwards?
        [
          'E5',
          'F#5',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        ]
      ];

      scales.forEach(scale => {
        const res = getMajorScale(scale[0]!);
        expect(res).toEqual(scale as Note[]);
      });
    });
  });

  describe('#getMinorScale', () => {
    it('should return eight notes', () => {
      const res = getMinorScale('C2');
      expect(res.length).toEqual(8);
    });

    it('first and last note should be octaves', () => {
      const res = getMinorScale('C2');
      expect(res[0]).toEqual('C2');
      expect(res[res.length - 1]).toEqual('C3');
    });

    it('should return the proper scale', () => {
      const scales: (Note | undefined)[][] = [
        ['B3', 'C#4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4'],
        ['C#4', 'D#4', 'E4', 'F#4', 'G#4', 'A4', 'B4', 'C#5'],
        ['E2', 'F#2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3'],
        ['F#3', 'G#3', 'A3', 'B3', 'C#4', 'D4', 'E4', 'F#4'],
        ['G#4', 'A#4', 'B4', 'C#5', 'D#5', 'E5', 'F#5', undefined]
      ];

      scales.forEach(scale => {
        const res = getMinorScale(scale[0]!);
        expect(res).toEqual(scale as Note[]);
      });
    });
  });

  describe('#buildMidiFromScale', () => {
    it('should build the correspond midi', () => {
      const scales: (Note | undefined)[][] = [
        ['B3', 'C#4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4'],
        ['F#3', 'G#3', 'A3', 'B3', 'C#4', 'D4', 'E4', 'F#4']
      ];

      const expected: MidiNote[][] = [
        [
          ['B3', 2],
          ,
          ['C#4', 2],
          ,
          ['D4', 2],
          ,
          ['E4', 2],
          ,
          ['F#4', 2],
          ,
          ['G4', 2],
          ,
          ['A4', 2],
          ,
          ['B4', 2],
          ,
        ],
        [
          ['F#3', 2],
          ,
          ['G#3', 2],
          ,
          ['A3', 2],
          ,
          ['B3', 2],
          ,
          ['C#4', 2],
          ,
          ['D4', 2],
          ,
          ['E4', 2],
          ,
          ['F#4', 2],
          ,
        ]
      ];

      scales.forEach((scale, i) => {
        expect(buildMidiFromScale(scale)).toEqual(expected[i]);
      });
    });
  });
});
