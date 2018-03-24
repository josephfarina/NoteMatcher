import * as React from "react";
import { makeButton } from "./util";
import { audioControl } from "./../../common/state";
import { connect } from "react-redux";

function PlayPauseButton({
  isRecording,
  startRecording,
  stopRecording
}: {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
}) {
  return (
    <div id="play-pause-button" className="field has-addons">
      {!isRecording &&
        makeButton({
          onClick: startRecording,
          active: false,
          icon: "circle",
          iconClass: "has-text-danger",
          disabled: isRecording,
          keyboardShortcut: "CTRL-R",
          tooltip: "Click to Record and analyze your singing in real time"
        })}

      {isRecording &&
        makeButton({
          onClick: stopRecording,
          active: false,
          icon: "pause",
          keyboardShortcut: "CTRL-R",
          tooltip: "Click to stop recording"
        })}
    </div>
  );
}

export default connect(
  state => ({
    isRecording: audioControl.getIsRecording(state)
  }),
  dispatch => ({
    startRecording() {
      dispatch(audioControl.startRecording());
    },
    stopRecording() {
      dispatch(audioControl.stopRecording());
    }
  })
)(PlayPauseButton);
