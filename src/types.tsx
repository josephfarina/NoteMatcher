type IBreakPointResults<BP = IBreakPoints> = { [k in keyof BP]: boolean };

type BreakPointsDefaultNames =
  | 'extraSmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'extraLarge'
  | 'infinity';

type IBreakPoints<BPNames extends string = BreakPointsDefaultNames> = {
  [k in BPNames]: number
};

interface IBrowser<BP = IBreakPoints> {
  _responsiveState: boolean;
  breakpoints: BP;
  greaterThan: IBreakPointResults<BP>;
  is: IBreakPointResults<BP>;
  lessThan: IBreakPointResults<BP>;
  mediaType: string;
  orientation: string;
}

interface StateRoot {
  audioControl: StateAudioControl;
  browser: IBrowser;
  browserCompatibility: StateBrowserCompatibility;
  notifications: StateNotifications;
  pitchData: StatePitchData;
}

interface StatePitchData {
  [note: string]: FreqDataPoint[];
}

type BeatDuration = number;
type MidiNote = [Note, BeatDuration] | undefined;
type EditMode = 'draw' | 'erase' | null;

interface StateAudioControl {
  audioPlaybackVolume: number;
  audioURL: string | null;
  beatsInView: [number, number]; // start - end beat
  currentBeat: number;
  editMode: EditMode;
  gotPermissionForAudio: boolean;
  // the most recent note that was recorded by pitch data
  // used to vertically scroll to the singing efficiently
  lastNoteRecorded: Note | null;
  measures: number;
  metronome: boolean;
  midi: MidiNote[];
  midiPlaybackOption: MidiPlaybackOption;
  midiPlaybackVolume: number;
  playing: boolean;
  recording: boolean;
  rowHeight: number;
  signature: [number, number];
  startTime: number; // unix timestamp
  tempo: number;
}

type NotificationType = 'danger' | 'warning';

type NotificationI = {
  browserIssue?: boolean;
  message?: string;
  type: NotificationType;
};

type StateNotifications = NotificationI[];

interface StateBrowserCompatibility {
  audioContext: boolean;
  audioRecording: boolean;
  getUserMedia: boolean;
}

type MidiPlaybackOption =
  | 'Always Play MIDI'
  | 'Never Play MIDI'
  | 'Only The First Note';

interface Action<T> {
  payload?: T;
  type: string;
}

type Thunk<T> = (
  dispatch: (action: Action<T> | Thunk<T>) => void,
  getState: () => StateRoot
) => void;

type Dispatch = (x: Thunk<any> | Action<any>) => any;

interface FreqDataPoint {
  actualFreq: number;
  centsOffExpected: number;
  expectedFreq: number;
  note: Note;
  time: Date;
}

type Note =
  | 'C0'
  | 'C#0'
  | 'D0'
  | 'D#0'
  | 'E0'
  | 'F0'
  | 'F#0'
  | 'G0'
  | 'G#0'
  | 'A0'
  | 'A#0'
  | 'B0'
  | 'C1'
  | 'C#1'
  | 'D1'
  | 'D#1'
  | 'E1'
  | 'F1'
  | 'F#1'
  | 'G1'
  | 'G#1'
  | 'A1'
  | 'A#1'
  | 'B1'
  | 'C2'
  | 'C#2'
  | 'D2'
  | 'D#2'
  | 'E2'
  | 'F2'
  | 'F#2'
  | 'G2'
  | 'G#2'
  | 'A2'
  | 'A#2'
  | 'B2'
  | 'C3'
  | 'C#3'
  | 'D3'
  | 'D#3'
  | 'E3'
  | 'F3'
  | 'F#3'
  | 'G3'
  | 'G#3'
  | 'A3'
  | 'A#3'
  | 'B3'
  | 'C4'
  | 'C#4'
  | 'D4'
  | 'D#4'
  | 'E4'
  | 'F4'
  | 'F#4'
  | 'G4'
  | 'G#4'
  | 'A4'
  | 'A#4'
  | 'B4'
  | 'C5'
  | 'C#5'
  | 'D5'
  | 'D#5'
  | 'E5'
  | 'F5'
  | 'F#5'
  | 'G5'
  | 'G#5'
  | 'A5'
  | 'A#5'
  | 'B5'
  | 'C6'
  | 'C#6'
  | 'D6'
  | 'D#6'
  | 'E6'
  | 'F6'
  | 'F#6'
  | 'G6'
  | 'G#6'
  | 'A6'
  | 'A#6'
  | 'B6'
  | 'C7'
  | 'C#7'
  | 'D7'
  | 'D#7'
  | 'E7'
  | 'F7'
  | 'F#7'
  | 'G7'
  | 'G#7'
  | 'A7'
  | 'A#7'
  | 'B7'
  | 'C8'
  | 'C#8'
  | 'D8'
  | 'D#8'
  | 'E8'
  | 'F8'
  | 'F#8'
  | 'G8'
  | 'G#8'
  | 'A8'
  | 'A#8'
  | 'B8';
