import { createReducer } from ".";
import notes from "./../pitch/notes";

const initialState: StatePitchData = {};

const UPDATE_DATA = "pitchdata::update_data";
const CLEAR_STATE = "pitchdata::clear_state";

const DEFAULT_NO_VALUE_ARRAY: any[] = [];

export default createReducer<StatePitchData>(initialState, {
  [UPDATE_DATA](state, action) {
    const {
      note,
      actualFreq,
      centsOffExpected,
      millisecondsFromStart
    } = action.payload;

    const currentNoteState = state[note];
    const actaulNote = notes[note];
    const nextDataPoint: FreqDataPoint = {
      time: millisecondsFromStart,
      note,
      actualFreq,
      centsOffExpected,
      expectedFreq: actaulNote && actaulNote.frequency
    };

    if (!currentNoteState) {
      return {
        ...state,
        [note]: [nextDataPoint]
      };
    }

    return {
      ...state,
      [note]: [...currentNoteState, nextDataPoint]
    };
  },
  [CLEAR_STATE]() {
    return {};
  }
});

export function addDataPoint(
  note: Note,
  actualFreq: number,
  centsOffExpected: number,
  millisecondsFromStart: number
): Action<Partial<FreqDataPoint> & { millisecondsFromStart: number }> {
  return {
    type: UPDATE_DATA,
    payload: { note, actualFreq, centsOffExpected, millisecondsFromStart }
  };
}

export function clearState(): Action<void> {
  return { type: CLEAR_STATE };
}

export function getNoteSlice(state: StateRoot, note: Note): FreqDataPoint[] {
  return state.pitchData[note] || DEFAULT_NO_VALUE_ARRAY;
}
