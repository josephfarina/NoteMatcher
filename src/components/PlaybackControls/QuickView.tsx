import * as React from "react";
import { connect } from "react-redux";
import cn from "classnames";
import { audioControl } from "./../../common/state";
import { makeSection, makeButton } from "./util";
import { Radio, Input } from "../";

import "./QuickView.css";

interface Props {
  getRef: (ref: HTMLDivElement | null) => any;
  toggleMetronome: () => void;
  metronome: boolean;
  updateRowHeight: (num: number) => void;
  rowHeight: number;
  isRecording: boolean;
  midiPlaybackOptions: MidiPlaybackOption[];
  selectedMidiPlaybackOption: MidiPlaybackOption;
  updateMidiPlaybackOption: (option: MidiPlaybackOption) => void;
  tempo: number;
  updateTempo: (tempo: number) => void;
  measures: number;
  updateMeasures: (tempo: number) => void;
  midiPlaybackVolume: number;
  updateMidiPlaybackVolume: (numberLessThanOne: number) => void;
  //audioPlaybackVolume: number;
  updateAudioPlaybackVolume: (numberLessThanOne: number) => void;
  onRequestClose: () => void;
}

export function QuickViewButton({
  quickviewOpen,
  toggleQuickView,
  getQuickViewTrigger
}: {
  quickviewOpen: boolean;
  toggleQuickView: () => void;
  getQuickViewTrigger: (ref: HTMLParagraphElement) => any;
}) {
  return makeButton({
    ref: getQuickViewTrigger,
    onClick: toggleQuickView,
    active: quickviewOpen,
    icon: "cog",
    tooltip: "Change and edit various \n editor and musical settings",
    id: "quick-view-button"
  });
}

class QuickView extends React.Component<Props, {}> {
  render() {
    const {
      getRef,
      toggleMetronome,
      metronome,
      updateRowHeight,
      rowHeight,
      isRecording,
      midiPlaybackOptions,
      selectedMidiPlaybackOption,
      updateMidiPlaybackOption,
      tempo,
      updateTempo,
      measures,
      updateMeasures,
      midiPlaybackVolume,
      updateMidiPlaybackVolume,
      //audioPlaybackVolume,
      //updateAudioPlaybackVolume,
      onRequestClose
    } = this.props;

    return (
      <div className="quickview" ref={ref => getRef(ref)}>
        <div className="quickview-header">
          Control Panel
          <button
            onClick={onRequestClose}
            className="button is-danger is-small"
          >
            <span>Close</span>
            <span className="icon is-small">
              <i className="fa fa-times" />
            </span>
          </button>
        </div>

        <div className="quickview-body">
          {makeSection(
            <p className="control" onClick={toggleMetronome}>
              <button
                className={cn("button", {
                  "is-dark": metronome,
                  "is-outlined": !metronome
                })}
              >
                {metronome && <span>Turn Metronome Off</span>}
                {!metronome && <span>Turn Metronome On</span>}
              </button>
            </p>
          )}

          {makeSection(
            <Input
              onChange={updateRowHeight}
              value={rowHeight}
              width={50}
              step={1}
              min={15}
              max={50}
              disabled={isRecording}
              title="drag to adjust the row size"
            />,
            "Adjust Note Heights"
          )}

          {makeSection(
            <Radio
              disabled={isRecording}
              values={midiPlaybackOptions}
              value={selectedMidiPlaybackOption}
              onChange={updateMidiPlaybackOption}
            />,
            "Audio Playback Option"
          )}

          {makeSection(
            <div className="select">
              <select
                disabled={isRecording}
                value={tempo}
                onChange={e => {
                  updateTempo(+e.target.value);
                }}
              >
                {(() => {
                  const values = [];
                  for (let i = 90; i <= 160; i++) {
                    values.push(<option key={i}>{i}</option>);
                  }
                  return values;
                })()}
              </select>
            </div>,
            "Tempo"
          )}

          {makeSection(
            <div className="select">
              <select
                disabled={isRecording}
                value={measures}
                onChange={e => updateMeasures(+e.target.value)}
              >
                <option>4</option>
                <option>8</option>
                <option>16</option>
                <option>24</option>
                <option>32</option>
              </select>
            </div>,
            "Measures"
          )}

          {makeSection(
            <Input
              width={50}
              step={0.1}
              min={0}
              max={1}
              value={midiPlaybackVolume}
              onChange={updateMidiPlaybackVolume}
            />,
            "Midi Volume"
          )}

          {/*makeSection(
            <Input
              width={50}
              step={0.1}
              min={0}
              max={1}
              value={audioPlaybackVolume}
              onChange={updateAudioPlaybackVolume}
            />,
            "Recording Volume"
          )*/}

        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    metronome: audioControl.getIsMetronomeOn(state),
    rowHeight: audioControl.getRowHeight(state),
    isRecording: audioControl.getIsRecording(state),
    midiPlaybackOptions: audioControl.getMidiPlaybackOptions(),
    tempo: audioControl.getTempo(state),
    measures: audioControl.getMeasures(state),
    midiPlaybackVolume: audioControl.getMidiPlaybackVolume(state),
    //audioPlaybackVolume: audioControl.getAudioPlaybackVolume(state),
    selectedMidiPlaybackOption: audioControl.getSelectedMidiPlaybackOption(
      state
    )
  }),
  dispatch => ({
    toggleMetronome() {
      dispatch(audioControl.toggleMetronome());
    },
    updateRowHeight(height: number) {
      dispatch(audioControl.updateRowHeight(height));
    },
    updateMidiPlaybackOption(option: MidiPlaybackOption) {
      dispatch(audioControl.updateMidiPlaybackOption(option));
    },
    updateTempo(tempo: number) {
      dispatch(audioControl.updateTempo(tempo));
    },
    updateMeasures(measures: number) {
      dispatch(audioControl.updateMeasures(measures));
    },
    updateMidiPlaybackVolume(volume: number) {
      dispatch(audioControl.updateMidiPlaybackVolume(volume));
    },
    updateAudioPlaybackVolume(volume: number) {
      dispatch(audioControl.updateAudioPlaybackVolume(volume));
    }
  })
)(QuickView);
