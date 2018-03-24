import { createReducer, notifications } from ".";

const initialState: StateBrowserCompatibility = {
  audioContext: false,
  audioRecording: true,
  getUserMedia: false
};

const AUDIO_CONTEXT_EXISTS = "browserCompatibility::audioContextExists";
const AUDIO_RECORDING_NOT_POSSIBLE =
  "browserCompatibility::audioRecordingNotPossible";
const GET_USER_MEDIA_EXISTS = "browserCompatibility::getUserMedia";

export default createReducer<StateBrowserCompatibility>(initialState, {
  [AUDIO_CONTEXT_EXISTS](state) {
    return { ...state, audioContext: true };
  },

  [AUDIO_RECORDING_NOT_POSSIBLE](state) {
    return { ...state, audioRecording: true };
  },

  [GET_USER_MEDIA_EXISTS](state) {
    return { ...state, getUserMedia: true };
  }
});

export const getAudioContextExists = (state: StateRoot) =>
  state.browserCompatibility.audioContext;

export const getUserMediaExists = (state: StateRoot) =>
  state.browserCompatibility.getUserMedia;

export const getAudioRecordingExists = (state: StateRoot) =>
  state.browserCompatibility.audioRecording;

export function audioRecordingNotPossible(): Action<void> {
  return { type: AUDIO_RECORDING_NOT_POSSIBLE };
}

export function getUserMediaError(
  error: string | { name: string }
): Thunk<any> {
  return dispatch => {
    if (error === "NOT IMPLEMENTED") {
      let message =
        "Voice recording will not work with this browser. You will only be able to utilize the midi editor";
      return dispatch(
        notifications.addNotification({
          browserIssue: true,
          message,
          type: "danger"
        })
      );
    }

    const deniedPermissionErrors = ["PermissionDeniedError", "NotAllowedError"];

    if (
      typeof error !== "string" &&
      deniedPermissionErrors.includes(error.name)
    ) {
      dispatch(
        notifications.addNotification({
          message:
            "We are unable to access your microphone. Is it possible that you denied permission? Try refreshing the browser and granting permission.",
          type: "danger"
        })
      );
    } else if (typeof error !== "string") {
      // todo: INCLUDE ERROR MESSAGE SOMEWHO
      dispatch(
        notifications.addNotification({
          message:
            "We are not sure what happened, but we cannot access your microphone. Could you please email this error message to use so we can figure out what went wrong?",
          type: "danger"
        })
      );
    }
  };
}

export function checkCompatibility(): Thunk<any> {
  return (dispatch, getState) => {
    if ((window as any).AUDIO_CONTEXT_IMPLEMENTED) {
      // added in polyfill.js
      dispatch({ type: AUDIO_CONTEXT_EXISTS });
    }

    const state = getState();
    const audioContextExists = getAudioRecordingExists(state);

    if (!audioContextExists) {
      let message: string =
        "Unfortunately nothing in this app will work with the current version of your browser";

      dispatch(
        notifications.addNotification({
          browserIssue: true,
          message,
          type: "danger"
        })
      );
    }
  };
}
