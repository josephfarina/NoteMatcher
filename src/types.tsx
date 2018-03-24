type IBreakPointResults<BP = IBreakPoints> = { [k in keyof BP]: boolean };

type BreakPointsDefaultNames =
  | "extraSmall"
  | "small"
  | "medium"
  | "large"
  | "extraLarge"
  | "infinity";

type IBreakPoints<BPNames extends string = BreakPointsDefaultNames> = {
  [k in BPNames]: number
};

interface IBrowser<BP = IBreakPoints> {
  _responsiveState: boolean;
  mediaType: string;
  orientation: string;
  lessThan: IBreakPointResults<BP>;
  greaterThan: IBreakPointResults<BP>;
  is: IBreakPointResults<BP>;
  breakpoints: BP;
}

interface StateRoot {
  pitchData: StatePitchData;
  audioControl: StateAudioControl;
  notifications: StateNotifications;
  browserCompatibility: StateBrowserCompatibility;
  browser: IBrowser;
}

interface StatePitchData {
  [note: string]: FreqDataPoint[];
}

type BeatDuration = number;
type MidiNote = [Note, BeatDuration] | undefined;
type EditMode = "draw" | "erase" | null;

interface StateAudioControl {
  startTime: number; // unix timestamp
  recording: boolean;
  playing: boolean;
  audioURL: string | null;
  tempo: number;
  signature: [number, number];
  measures: number;
  currentBeat: number;
  midi: MidiNote[];

  // the most recent note that was recorded by pitch data
  // used to vertically scroll to the singing efficiently
  lastNoteRecorded: Note | null;

  editMode: EditMode;
  metronome: boolean;

  beatsInView: [number, number]; // start - end beat

  // move to own state maybe
  rowHeight: number;
  midiPlaybackOption: MidiPlaybackOption;
  midiPlaybackVolume: number;
  audioPlaybackVolume: number;

  gotPermissionForAudio: boolean;
}

type NotificationType = "danger" | "warning";

type NotificationI = {
  type: NotificationType;
  message?: string;
  browserIssue?: boolean;
};

type StateNotifications = NotificationI[];

interface StateBrowserCompatibility {
  getUserMedia: boolean;
  audioContext: boolean;
  audioRecording: boolean;
}

type MidiPlaybackOption =
  | "Always Play MIDI"
  | "Only The First Note"
  | "Never Play MIDI";

interface Action<T> {
  type: string;
  payload?: T;
}

type Thunk<T> = (
  dispatch: (action: Action<T> | Thunk<T>) => void,
  getState: () => StateRoot
) => void;

type Dispatch = (x: Thunk<any> | Action<any>) => any;

interface FreqDataPoint {
  time: Date;
  actualFreq: number;
  expectedFreq: number;
  centsOffExpected: number;
  note: Note;
}

type Note =
  | "C0"
  | "C#0"
  | "D0"
  | "D#0"
  | "E0"
  | "F0"
  | "F#0"
  | "G0"
  | "G#0"
  | "A0"
  | "A#0"
  | "B0"
  | "C1"
  | "C#1"
  | "D1"
  | "D#1"
  | "E1"
  | "F1"
  | "F#1"
  | "G1"
  | "G#1"
  | "A1"
  | "A#1"
  | "B1"
  | "C2"
  | "C#2"
  | "D2"
  | "D#2"
  | "E2"
  | "F2"
  | "F#2"
  | "G2"
  | "G#2"
  | "A2"
  | "A#2"
  | "B2"
  | "C3"
  | "C#3"
  | "D3"
  | "D#3"
  | "E3"
  | "F3"
  | "F#3"
  | "G3"
  | "G#3"
  | "A3"
  | "A#3"
  | "B3"
  | "C4"
  | "C#4"
  | "D4"
  | "D#4"
  | "E4"
  | "F4"
  | "F#4"
  | "G4"
  | "G#4"
  | "A4"
  | "A#4"
  | "B4"
  | "C5"
  | "C#5"
  | "D5"
  | "D#5"
  | "E5"
  | "F5"
  | "F#5"
  | "G5"
  | "G#5"
  | "A5"
  | "A#5"
  | "B5"
  | "C6"
  | "C#6"
  | "D6"
  | "D#6"
  | "E6"
  | "F6"
  | "F#6"
  | "G6"
  | "G#6"
  | "A6"
  | "A#6"
  | "B6"
  | "C7"
  | "C#7"
  | "D7"
  | "D#7"
  | "E7"
  | "F7"
  | "F#7"
  | "G7"
  | "G#7"
  | "A7"
  | "A#7"
  | "B7"
  | "C8"
  | "C#8"
  | "D8"
  | "D#8"
  | "E8"
  | "F8"
  | "F#8"
  | "G8"
  | "G#8"
  | "A8"
  | "A#8"
  | "B8";
