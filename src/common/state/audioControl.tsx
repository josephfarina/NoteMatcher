import * as M from "moment";
import { createReducer, pitchData, browserCompatibility, updateUrlToReflectState } from "./";
import { scaleLinear } from "d3-scale";
import { createSelector } from "reselect";
import { pitchDetection } from "./../pitch";
import { getMajorScale, buildMidiFromScale } from "./../musicMath";
import createOscillator from "./../createOscillator";
import notes, { FREQUENCY_MAP_BY_NOTE } from "./../pitch/notes";
const RecordRTC = require("recordrtc");

// prevent errors when rendering in node
function performanceNow() {
  if (window && window.performance) {
    return window.performance.now();
  }

  return new Date().valueOf();
}

const MIDI_PLAYBACK_OPTIONS: MidiPlaybackOption[] = [
  "Always Play MIDI",
  //"While Recording",
  "Only The First Note",
  "Never Play MIDI"
];

const DEFAULT_MIDI_GAIN = 0.5;
const GAIN_MULTIPLIER = 0.2; // its to loud when it is 1
const DEFAULT_AUDIO_GAIN = 0.5;
let OSCILLATORS: OscillatorNode[] = [];
let PIANO_KEY_OSCILLATOR: OscillatorNode | null = null;

const initialState: StateAudioControl = {
  tempo: 100,
  // ONLY ALLOW 3/4 2/4 and 4/4 for now!
  signature: [4, 4],
  measures: 4,
  startTime: performanceNow(),
  recording: false,
  playing: false,
  audioURL: null,
  currentBeat: 0,
  midi: buildMidiFromScale(getMajorScale('C3')),
  editMode: null,
  beatsInView: [0, 4 * 4], // find a way a better way to default
  rowHeight: 50,
  midiPlaybackOption: "Always Play MIDI",
  midiPlaybackVolume: DEFAULT_MIDI_GAIN,
  audioPlaybackVolume: DEFAULT_AUDIO_GAIN,
  metronome: true,
  lastNoteRecorded: null,
  gotPermissionForAudio: false
};

let AUDIO_CONTEXT: AudioContext;
let GAIN_NODE: GainNode;
let METRONOME_GAIN_NODE: GainNode;
let ANALYSER: AnalyserNode;

let ANIMATION_FRAME: number | null;
let AUDIO_RECORDER: any;
let PLAYING_INTERVAL: any;
let RECORDING_STREAM: MediaStream;
let AUDIO_PLAYER: HTMLAudioElement | null;

const START_PLAYING = "recordingSettings::startPlaying";
const STOP_PLAYING = "recordingSettings::stopPlaying";
const START_RECORDING = "recordingSettings::startRecording";
const STOP_RECORDING = "recordingSettings::stopRecording";
const RESET_TIME = "recordingSettings::resetTime";
const UPDATE_CURRENT_BEAT = "recordingSettings::updateCurrentBeat";
const CLEAR_AUDIO_URL = "recordingSettings::clearAudioUrl";
const UPDATE_MIDI_VALUES = "recordingSettings::updateMidiValues";
const TOGLE_EDIT_MIDI_NOTES_MODE = "recordingSettings::editMidiNotesMode";
const UPDATE_BEATS_IN_VIEW = "recordingSettings::updateBeatsInView";
const UPDATE_ROW_HEIGHT = "recordingSettings::updateRowHeight";
const UPDATE_MIDI_PLAYBACK_OPTION =
  "recordingSettings::updateMidiPlaybackSettings";
const UPDATE_MIDI_PLAYBACK_VOLUME =
  "recordingSettings::updateMidiPlaybackVolumen";
const UPDATE_AUDIO_PLAYBACK_VOLUME =
  "recordingSettings::updateAudioPlaybackVolume";
const UPDATE_TEMPO = "recordingSettings::updateTempo";
const TOGGLE_METRONOME = "recordingSettings::toggleMetronome";
const UPDATE_MEASURES = "recordingSettings::updateMeasures";
const UPDATE_LAST_NOTE_RECORDED = "recordingSettings::updateLastNoteRecorded";
const GOT_PERMISSION_FOR_AUDIO = "recordingSettings:gotPermissionForAudio";

export default createReducer<StateAudioControl>(initialState, {
  [RESET_TIME](state) {
    return {
      ...state,
      startTime: performanceNow(),
      currentBeat: 0
    };
  },

  [CLEAR_AUDIO_URL](state) {
    return {
      ...state,
      audioURL: null
    };
  },

  [STOP_RECORDING](state, action) {
    return {
      ...state,
      recording: false,
      audioURL: action.payload
    };
  },

  [START_RECORDING](state) {
    return {
      ...state,
      recording: true
    };
  },

  [START_PLAYING](state) {
    return {
      ...state,
      playing: true
    };
  },

  [STOP_PLAYING](state) {
    return {
      ...state,
      playing: false
    };
  },

  [UPDATE_CURRENT_BEAT](state, action) {
    return {
      ...state,
      currentBeat: action.payload
    };
  },

  [UPDATE_MIDI_VALUES](state, action) {
    return {
      ...state,
      midi: action.payload
    };
  },

  [TOGLE_EDIT_MIDI_NOTES_MODE](state, action) {
    return {
      ...state,
      editMode: action.payload
    };
  },

  [UPDATE_BEATS_IN_VIEW](state, action) {
    return {
      ...state,
      beatsInView: action.payload
    };
  },

  [UPDATE_ROW_HEIGHT](state, action) {
    return {
      ...state,
      rowHeight: action.payload
    };
  },

  [UPDATE_MIDI_PLAYBACK_OPTION](state, action) {
    return {
      ...state,
      midiPlaybackOption: action.payload
    };
  },

  [UPDATE_MIDI_PLAYBACK_VOLUME](state, action) {
    return {
      ...state,
      midiPlaybackVolume: action.payload
    };
  },

  [UPDATE_AUDIO_PLAYBACK_VOLUME](state, action) {
    return {
      ...state,
      audioPlaybackVolume: action.payload
    };
  },

  [UPDATE_TEMPO](state, action) {
    return { ...state, tempo: action.payload };
  },

  [UPDATE_MEASURES](state, action) {
    return { ...state, measures: action.payload };
  },

  [TOGGLE_METRONOME](state) {
    return { ...state, metronome: !state.metronome };
  },

  [UPDATE_LAST_NOTE_RECORDED](state, action) {
    return { ...state, lastNoteRecorded: action.payload };
  },

  [GOT_PERMISSION_FOR_AUDIO](state) {
    return { ...state, gotPermissionForAudio: true };
  }
});

/**
 *
 * Selectors
 *
 */

export const getHasPermissionForAudio = (state: StateRoot) =>
  state.audioControl.gotPermissionForAudio;

export const getStartTime = (state: StateRoot) => state.audioControl.startTime;

export const getEndTime = (state: StateRoot) => {
  const start = getStartTime(state);
  const duration = getRecordingDurationInMilliseconds(state);
  return start + duration;
};

export const getIsPlaying = (state: StateRoot) => state.audioControl.playing;

export const getIsRecording = (state: StateRoot) =>
  state.audioControl.recording;

export const getTempo = (state: StateRoot) => state.audioControl.tempo;

export const getLastNoteRecorded = (state: StateRoot) =>
  state.audioControl.lastNoteRecorded;

export const getTimeSignature = (state: StateRoot) =>
  state.audioControl.signature;

export const getMeasures = (state: StateRoot) => state.audioControl.measures;

export const getCurrentBeat = (state: StateRoot) =>
  state.audioControl.currentBeat;

export const getAudioUrl = (state: StateRoot) => state.audioControl.audioURL;

export const getEditMode = (state: StateRoot) => state.audioControl.editMode;

export const getBeatsInView = (state: StateRoot) =>
  state.audioControl.beatsInView;

export const getBeatCount = (state: StateRoot) =>
  state.audioControl.measures * state.audioControl.signature[0];

export const getMidi = (state: StateRoot) => state.audioControl.midi;

export const getIsMetronomeOn = (state: StateRoot) =>
  state.audioControl.metronome;

export const getMidiPlaybackOptions = (): MidiPlaybackOption[] =>
  MIDI_PLAYBACK_OPTIONS;

export const getMidiPlaybackVolume = (state: StateRoot): number =>
  state.audioControl.midiPlaybackVolume;

export const getAudioPlaybackVolume = (state: StateRoot): number =>
  state.audioControl.audioPlaybackVolume;

export const getSelectedMidiPlaybackOption = (
  state: StateRoot
): MidiPlaybackOption => state.audioControl.midiPlaybackOption;

const midiNotSelectorFactory: (
  note: Note
) => (state: StateRoot) => MidiNote[] = (note: Note) =>
  createSelector(getMidi, midi => {
    return midi.map(beat => {
      if (Array.isArray(beat) && beat[0] === note) {
        return beat;
      }
      return undefined;
    });
  });

export const getMidiValuesByNote: {
  [note: string]: (state: StateRoot) => MidiNote[];
} = notes.reduce((acc, { note }) => {
  return {
    ...acc,
    [note]: midiNotSelectorFactory(note)
  };
}, {});

export const getRecordingDurationInMilliseconds = createSelector(
  getTempo,
  getTimeSignature,
  getMeasures,
  (tempo, signature, measures) => {
    const secondsInOneBeat = 60 / tempo;
    const [beatsPerMeasure] = signature;
    return secondsInOneBeat * beatsPerMeasure * measures * 1000;
  }
);

export const getDisplayTime = (state: StateRoot): string => {
  const currentTime = performanceNow() - getStartTime(state);
  const duration = getRecordingDurationInMilliseconds(state);
  return `${formatDuration(currentTime)} - ${formatDuration(duration)}`;
};

export const getRowHeight = (state: StateRoot): number =>
  state.audioControl.rowHeight;

/**
 *
 * Action
 *
 */

export function setUpStreamingAndAudioContext(): Thunk<any> {
  return (dispatch, getState) => {
    if (!AUDIO_CONTEXT) {
      AUDIO_CONTEXT = new AudioContext();
      ANALYSER = AUDIO_CONTEXT.createAnalyser();
    }

    if (!GAIN_NODE) {
      GAIN_NODE = AUDIO_CONTEXT.createGain();
      GAIN_NODE.gain.value = DEFAULT_MIDI_GAIN * GAIN_MULTIPLIER;
      GAIN_NODE.connect(AUDIO_CONTEXT.destination);
    }

    if (!METRONOME_GAIN_NODE) {
      METRONOME_GAIN_NODE = AUDIO_CONTEXT.createGain();
      METRONOME_GAIN_NODE.gain.value = 1;
      METRONOME_GAIN_NODE.connect(GAIN_NODE);
    }

    if (!RECORDING_STREAM && !getHasPermissionForAudio(getState())) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream: any) => {
          const input = AUDIO_CONTEXT.createMediaStreamSource(stream);
          input.connect(ANALYSER);
          RECORDING_STREAM = stream;
          dispatch({ type: GOT_PERMISSION_FOR_AUDIO });
        })
        .catch(error => {
          console.log(error);
          dispatch(browserCompatibility.getUserMediaError(error));
        });
    }
  };
}

export function resetTime(): Action<void> {
  OSCILLATORS.forEach(osc => {
    osc.disconnect();
  });
  OSCILLATORS = [];

  return { type: RESET_TIME };
}

export function updateCurrentBeat(beat: number): Action<number> {
  return { type: UPDATE_CURRENT_BEAT, payload: beat };
}

export function changeEditMode(payload: EditMode): Thunk<EditMode> {
  return (dispatch, getState) => {
    const isRecording = getIsRecording(getState());
    if (isRecording) return;
    dispatch({ type: TOGLE_EDIT_MIDI_NOTES_MODE, payload });
    updateUrlToReflectState(getState());
  };
}

export function updateBeatsInView(
  payload: [number, number]
): Thunk<[number, number]> {
  return (dispatch, getState) => {
    dispatch({ type: UPDATE_BEATS_IN_VIEW, payload });
    updateUrlToReflectState(getState());
  }
}

export function updateTempo(tempo: number): Thunk<number> {
  return (dispatch, getState) => {
    dispatch({ type: UPDATE_TEMPO, payload: tempo });
    updateUrlToReflectState(getState());
  }
}

export function updateMeasures(measures: number): Thunk<any> {
  return (dispatch, getState) => {
    const [beatPerMeasure] = getTimeSignature(getState());
    dispatch({ type: UPDATE_MEASURES, payload: measures });
    dispatch(updateBeatsInView([0, measures * beatPerMeasure]));
    updateUrlToReflectState(getState());
  };
}

export function updateMeasuresToFitBeatCount(beatCount: number): Thunk<any> {
  return (dispatch, getState) => {
    const [beatPerMeasure] = getTimeSignature(getState());
    const measures = Math.ceil(beatCount / beatPerMeasure);
    dispatch(updateMeasures(measures));
  };
}

export function toggleMetronome(): Thunk<void> {
  return (dispatch, getState) => {
    if (getIsMetronomeOn(getState())) {
      METRONOME_GAIN_NODE.gain.value = 0;
    } else {
      METRONOME_GAIN_NODE.gain.value = 1;
    }

    dispatch({ type: TOGGLE_METRONOME });

    updateUrlToReflectState(getState());
  };
}

/**
 *
 * Recording
 *
 */

export function stopRecording(): Thunk<any> {
  return (dispatch, getState) => {
    dispatch(stopPlaying());
    dispatch({ type: STOP_RECORDING });

    window.cancelAnimationFrame(ANIMATION_FRAME as number);
    ANIMATION_FRAME = null;

    const isRecording = getIsRecording(getState());

    if (isRecording && AUDIO_RECORDER && AUDIO_RECORDER.stopRecording) {
      AUDIO_RECORDER.stopRecording((audioURL: string) => {
        dispatch({
          type: STOP_RECORDING,
          payload: audioURL
        });
      });
    }
  };
}

export function toggleRecording(): Thunk<any> {
  return (dispatch, getState) => {
    const isRecording = getIsRecording(getState());
    if (isRecording) {
      dispatch(stopRecording());
    } else {
      dispatch(startRecording());
    }
  };
}

export function startRecording(): Thunk<any> {
  return (dispatch, getState) => {
    function checkPitch() {
      const state = getState();
      const startTime = getStartTime(state);
      const lastNoteRecorded = getLastNoteRecorded(state);

      if (!getIsPlaying(state)) {
        return dispatch(stopRecording());
      }

      const res = pitchDetection(AUDIO_CONTEXT, ANALYSER);

      if (res) {
        dispatch(
          pitchData.addDataPoint(
            res.note,
            res.frequency,
            res.cents,
            window.performance.now() - startTime!
          )
        );

        if (lastNoteRecorded !== res.note) {
          dispatch({ type: UPDATE_LAST_NOTE_RECORDED, payload: res.note });
        }
      }

      // null ANIMATION_FRAME elsewhere to stop the loop
      if (ANIMATION_FRAME) {
        ANIMATION_FRAME = window.requestAnimationFrame(checkPitch);
      }
    }

    dispatch(pitchData.clearState());
    dispatch(resetTime());
    dispatch({ type: START_RECORDING });
    dispatch(startPlaying());

    try {
      AUDIO_RECORDER = RecordRTC(RECORDING_STREAM, { type: "audio" });
      AUDIO_RECORDER.startRecording();
    } catch (e) {
      console.warn(e, "error trying to record");
    }

    ANIMATION_FRAME = window.requestAnimationFrame(checkPitch);
  };
}

/**
 *
 * Playback
 *
 */

export function stopPlaying(): Thunk<any> {
  return dispatch => {
    clearInterval(PLAYING_INTERVAL);
    if (AUDIO_PLAYER) {
      AUDIO_PLAYER.src = "";
      AUDIO_PLAYER = null;
    }

    dispatch(resetTime());
    dispatch({ type: STOP_PLAYING });
    dispatch(updateCurrentBeat(0));
  };
}

export function startPlaying(): Thunk<any> {
  return (dispatch, getState) => {
    let lookAhead = 3;
    const bufferThreshold = 1;
    let scheduledTill: number;
    let lastBeat: number;

    getAllBeatsTimeFromStart(getState()); // make sure it is already memoized

    // start playing and capture the audio contexts current time at the same
    // time
    dispatch({ type: START_PLAYING });
    dispatch({ type: RESET_TIME });
    const audioContextCurrTime = AUDIO_CONTEXT.currentTime;

    // Play recorded track
    const audioUrl = getAudioUrl(getState());
    if (!getIsRecording(getState()) && audioUrl) {
      AUDIO_PLAYER = new Audio(getAudioUrl(getState())!);
      AUDIO_PLAYER.volume = getAudioPlaybackVolume(getState());
      AUDIO_PLAYER.play();
    }

    // initial go immediately and then have it loop on an interval
    go();
    PLAYING_INTERVAL = setInterval(go, 150);

    // mute or umute the metronome
    // based on if it is on or not
    if (getIsMetronomeOn(getState())) {
      METRONOME_GAIN_NODE.gain.value = 1;
    } else {
      METRONOME_GAIN_NODE.gain.value = 0;
    }

    scheduleMetronomeClicks(audioContextCurrTime);
    dispatch(updateCurrentBeat(0));

    function go() {
      const state = getState();
      const isPlaying = getIsPlaying(state);
      const isRecording = getIsRecording(state);

      if (isPlaying || isRecording) {
        const startTime = getStartTime(state);
        const duration = getRecordingDurationInMilliseconds(state);
        const now = window.performance.now() - startTime!;

        const loop = false; // todo add this and an icon to the state/ui
        if (now >= duration) {
          // this works for now but should find
          // a way to do this while mainting a metronome
          if (loop) {
            return dispatch(startPlaying());
          }

          return dispatch(stopPlaying());
        }

        const beatTimes = getAllBeatsTimeFromStart(state);
        let beat: null | number = null;
        for (let i = 0; i < beatTimes.length; i++) {
          if (Math.abs(beatTimes[i] - now) < 250) {
            beat = i;
            break;
          }
        }

        if (beat !== null && lastBeat !== beat) {
          dispatch(updateCurrentBeat(beat));
          lastBeat = beat;
        }

        const selectedMidiOption = getSelectedMidiPlaybackOption(state);

        if (selectedMidiOption === "Never Play MIDI") {
          return;
        }
        if (
          selectedMidiOption === "Only The First Note" &&
          !getIsRecording(state)
        ) {
          return;
        }

        if (typeof scheduledTill === "undefined") {
          if (
            getSelectedMidiPlaybackOption(state) ===
              "Only The First Note"
          ) {
            lookAhead = 1;
          }

          for (let i = 0; i <= lookAhead; i++) {
            scheduleNoteByBeat(i, audioContextCurrTime);
          }
          scheduledTill = lookAhead;
        } else if (beat === scheduledTill - bufferThreshold) {
          for (let i = scheduledTill + 1; i <= scheduledTill + lookAhead; i++) {
            if (selectedMidiOption !== "Only The First Note") {
              if (i >= beatTimes.length) break;
              scheduleNoteByBeat(i, audioContextCurrTime);
            }
          }
          scheduledTill += lookAhead;
        }
      } else {
        dispatch(stopPlaying());
      }
    }

    function scheduleMetronomeClicks(audioContextCurrTime: number) {
      const beatTimes = getAllBeatsTimeFromStart(getState());
      const tempo = getTempo(getState());
      beatTimes.forEach((time, i) => {
        const start = time / 1000 + audioContextCurrTime;
        const end = start + 60 / tempo / 4;
        const osc = (AUDIO_CONTEXT).createOscillator(); //AUDIO_CONTEXT.createOscillator();
        OSCILLATORS.push(osc);
        osc.connect(METRONOME_GAIN_NODE);
        osc.frequency.value = i % 4 === 0 ? 880 : 440;
        osc.start(start);
        osc.stop(end);
      });
    }

    function scheduleNoteByBeat(beat = 0, audioContextCurrTime: number) {
      const midi = getMidi(getState());
      const noteToPlay = midi[beat];

      if (Array.isArray(noteToPlay)) {
        const beatTimes = getAllBeatsTimeFromStart(getState());
        const frequency = FREQUENCY_MAP_BY_NOTE[noteToPlay[0] as any];
        const beatStartTime = beatTimes[beat] / 1000 + audioContextCurrTime;
        const beatEndTime =
          beatTimes[beat + noteToPlay[1]] / 1000 + audioContextCurrTime;
        scheduleNote(frequency, beatStartTime, beatEndTime);
      }
    }
  };
}

/**
 *
 * Helpers
 *
 */

// Time Helpers

function makeScaleRangeFunc(startTime: number, endTime: number, width: number) {
  return scaleLinear()
    .domain([startTime, endTime])
    .range([0, width]);
}

export const getXPosition: (
  state: StateRoot
) => (
  canvasWidth: number
) => (timeFromStart: number) => number = createSelector(
  getRecordingDurationInMilliseconds,
  duration =>
    createSelector(
      x => x,
      (canvasWidth: number) => {
        return makeScaleRangeFunc(0.0, duration, canvasWidth);
      }
    )
);

export function getAllBeatsTimeFromStart(state: StateRoot): number[] {
  return createSelector(
    getTempo,
    getRecordingDurationInMilliseconds,
    (tempo, duration) => {
      const millisecondsSecondsInOneBeat = 60 / tempo * 1000;
      const beats: number[] = [];
      let timeTracker = 0.0;
      while (timeTracker <= duration) {
        beats.push(timeTracker);
        timeTracker += millisecondsSecondsInOneBeat;
      }

      return beats;
    }
  )(state);
}

export const getAllBeatXCoordinates: (
  state: StateRoot
) => (width: number) => number[] = createSelector(
  getAllBeatsTimeFromStart,
  getRecordingDurationInMilliseconds,
  (allBeats, duration) =>
    createSelector(
      width => width,
      width => {
        const getXPosition = makeScaleRangeFunc(0.0, duration, width);
        return allBeats.map(getXPosition);
      }
    )
);

export const getWidthOfOneBeatInPixels = (state: StateRoot) => (
  width: number
) => {
  const [one, two] = getAllBeatXCoordinates(state)(width);
  return two - one;
};

export function getBeatNumberOfDrag(state: StateRoot) {
  return (width: number) => (dropPosition: number): number | null => {
    const allBeats = getAllBeatXCoordinates(state)(width);
    let closest: number | null = null;
    let minDiff: number | null = null;

    for (let i = 0; i < allBeats.length; i++) {
      const diff = Math.abs(allBeats[i] - dropPosition);

      if (minDiff === null || diff < minDiff) {
        closest = i;
        minDiff = diff;
      } 
    }

    return closest;
  };
}

/**
 *
 * Midi
 *
 */

export function updateMidiValues(payload: MidiNote[]): Thunk<any> {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_MIDI_VALUES,
      payload
    });

    updateUrlToReflectState(getState());
  }
}

export function editMidiNote(
  originalBeat: MidiNote,
  note: Note,
  startBeat: number,
  durationInBeats: number
): Thunk<any> {
  return (dispatch, getState) => {
    dispatch(deleteByBeat(originalBeat));
    dispatch(addMidiNote(note, startBeat, durationInBeats));
    if (getIsRecording(getState())) {
      dispatch(stopRecording());
    }
  };
}

export function addMidiNote(
  note: Note,
  startBeat: number,
  durationInBeats: number
): Thunk<any> {
  return (dispatch, getState) => {
    const state = getState();
    const currentMidi = getMidi(state);

    const endOfBeat = startBeat + durationInBeats - 1;
    const overlappingNotes: {
      [startPosition: number]: MidiNote;
    } = currentMidi.reduce((acc, midiBeat, i) => {
      if (Array.isArray(midiBeat)) {
        const endOfMidiNote = i + midiBeat[1] - 1;
        if (i > endOfBeat || startBeat > endOfMidiNote) return acc;

        return {
          ...acc,
          [i]: midiBeat
        };
      }

      return acc;
    }, {});

    const nextMidi = [...currentMidi];

    if (Object.keys(overlappingNotes).length === 0) {
      nextMidi[startBeat] = [note, durationInBeats];
    } else {
      Object.keys(overlappingNotes).forEach(startOfMidNote => {
        const currentMidNote = overlappingNotes[startOfMidNote as any]!;
        const endOfMidiNote = +startOfMidNote + currentMidNote[1] - 1;

        if (startBeat < +startOfMidNote) {
          if (endOfBeat < endOfMidiNote && endOfBeat >= +startOfMidNote) {
            nextMidi[endOfBeat + 1] = [
              currentMidNote[0],
              endOfMidiNote - endOfBeat
            ];
          }

          delete nextMidi[+startOfMidNote];
        } else {
          nextMidi[+startOfMidNote] = [
            currentMidNote[0],
            startBeat - +startOfMidNote
          ];
        }

        nextMidi[startBeat] = [note, durationInBeats];
      });
    }

    dispatch(updateMidiValues(nextMidi));
    if (getIsRecording(getState())) {
      dispatch(stopRecording());
    }
  };
}

export function deleteMidiNote(
  note: Note,
  startBeat: number,
  durationInBeats: number
): Thunk<any> {
  return (dispatch, getState) => {
    dispatch(addMidiNote(note, startBeat, durationInBeats));
    const currentMidi = [...getMidi(getState())];
    delete currentMidi[startBeat];
    dispatch(updateMidiValues(currentMidi));
    if (getIsRecording(getState())) {
      dispatch(stopRecording());
    }
  };
}

function deleteByBeat(originalBeat: MidiNote): Thunk<any> {
  return (dispatch, getState) => {
    const beatToDelete = getMidi(getState()).findIndex(
      beat => originalBeat === beat
    );
    const currentMidi = [...getMidi(getState())];
    delete currentMidi[beatToDelete];
    dispatch(updateMidiValues(currentMidi));
  };
}

function scheduleNote(freq: number, start: number, end: number) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    console.warn("Tryed to play a non finite note");
    return;
  }

  const osc = createOscillator(AUDIO_CONTEXT); // .createOscillator();
  OSCILLATORS.push(osc);
  osc.connect(GAIN_NODE);
  osc.frequency.value = freq;
  osc.start(start);
  osc.stop(end);
}

export function playNote(note: Note) {
  if (!AUDIO_CONTEXT || !GAIN_NODE) return;

  if (PIANO_KEY_OSCILLATOR) {
    PIANO_KEY_OSCILLATOR.disconnect();
    PIANO_KEY_OSCILLATOR = null;
  }

  PIANO_KEY_OSCILLATOR = createOscillator(AUDIO_CONTEXT); // .createOscillator();
  PIANO_KEY_OSCILLATOR.connect(GAIN_NODE);
  PIANO_KEY_OSCILLATOR.frequency.value = FREQUENCY_MAP_BY_NOTE[note];
  console.log("start");
  PIANO_KEY_OSCILLATOR.start(AUDIO_CONTEXT.currentTime);
  PIANO_KEY_OSCILLATOR.stop(AUDIO_CONTEXT.currentTime + 1);
}

export function updateMidiPlaybackOption(
  payload: MidiPlaybackOption
): Thunk<MidiPlaybackOption> {
  return (dispatch, getState) => {
    dispatch({ type: UPDATE_MIDI_PLAYBACK_OPTION, payload });
    updateUrlToReflectState(getState());
  }
}

export function updateMidiPlaybackVolume(
  numberOutOfOne: number = 0.5
): Thunk<number> {
  return (dispatch, getState) => {
    GAIN_NODE.gain.value = numberOutOfOne * GAIN_MULTIPLIER;
    dispatch({ type: UPDATE_MIDI_PLAYBACK_VOLUME, payload: numberOutOfOne });
    updateUrlToReflectState(getState());
  }
}

export function updateAudioPlaybackVolume(
  numberOutOfOne: number = 0.5
): Thunk<number> {
  return (dispatch, getState) => {
    AUDIO_PLAYER && (AUDIO_PLAYER.volume = numberOutOfOne);
    dispatch({ type: UPDATE_AUDIO_PLAYBACK_VOLUME, payload: numberOutOfOne });
    updateUrlToReflectState(getState());
  }
}

// Misc

export function formatDuration(milli: number /* in milliseconds */): string {
  const dur = M.duration(milli);

  let minute = "" + dur.minutes();
  if (minute.length === 1) minute = "0" + minute;

  let second = "" + dur.seconds();
  if (second.length === 1) second = "0" + second;

  let milliseconds = "" + dur.milliseconds();
  if (milliseconds.length === 1) milliseconds = "0" + milliseconds;
  if (milliseconds.length > 2) milliseconds = milliseconds[0] + milliseconds[1];

  return `${minute}:${second}:${milliseconds}`;
}

/**
 * Longterm:
 *
 * - add the ability to play at any beat in time
 *
 */

/* MAYBE Move these to there own state slice*/

export function updateRowHeight(num: number): Thunk<number> {
  return (dispatch, getState) => {
    dispatch({ type: UPDATE_ROW_HEIGHT, payload: num });
    updateUrlToReflectState(getState());
  }
}
