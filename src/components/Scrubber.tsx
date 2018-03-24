import * as React from 'react';
import { connect } from 'react-redux';
import notes from './../common/pitch/notes';
import './Scrubber.css';
import { audioControl } from './../common/state';

interface Props {
  width: number;

  startTime: number;
  trackTime: boolean;

  getXPosition: (width: number) => (timeFromStart: number) => number;
  allBeatTimes: number[];
  getBeatNumberOfDrag: (width: number) => (x: number) => number | null;
  updateCurrentBeat: (beat: number) => void;
  currentBeat: number;

  rowHeight: number;
}

interface State {
  mouseDown: boolean;
  currentTimeFromStart: number;
}

class Scrubber extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { mouseDown: false, currentTimeFromStart: 0 };
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.currentBeat !== nextProps.currentBeat) {
      const { allBeatTimes, currentBeat } = nextProps;
      this.setState({ currentTimeFromStart: allBeatTimes[currentBeat] });
    }
  }

  render() {
    const {
      width,
      getXPosition,
      rowHeight
      //  getBeatNumberOfDrag,
      //  updateCurrentBeat
    } = this.props;

    const xPosition = getXPosition(width)(this.state.currentTimeFromStart);

    /*
    return (
      <div
        onClick={e => {
          const beat = getBeatNumberOfDrag(width)(
            e.clientX - ANALYZER_LEFT_COL_WIDTH
          );
          if (beat !== null) {
            updateCurrentBeat(beat);
          }
        }}
        onMouseDown={() => this.setState({ mouseDown: true })}
        onMouseUp={() => this.setState({ mouseDown: false })}
        onMouseMove={e => {
          if (this.state && this.state.mouseDown) {
            const beat = getBeatNumberOfDrag(width)(
              e.clientX - ANALYZER_LEFT_COL_WIDTH
            );
            if (beat !== null) {
              updateCurrentBeat(beat);
            }
          }
        }}
        className="scrubber"
        style={{ width: width }}
      >
        <div
          className="scrubber-fill"
          style={{ right: width - xPosition }}
        />
      </div>
    );

    */

    return (
      <div
        className="scrubber"
        style={{
          left: 0,
          transform: `translateX(${xPosition}px)`,
          height: rowHeight * notes.length
        }}
      />
    );
  }
}

export default connect(
  (state: StateRoot) => {
    return {
      getXPosition: audioControl.getXPosition(state),
      allBeatTimes: audioControl.getAllBeatsTimeFromStart(state),
      startTime: audioControl.getStartTime(state),
      trackTime:
        audioControl.getIsPlaying(state) || audioControl.getIsRecording(state),
      getBeatNumberOfDrag: audioControl.getBeatNumberOfDrag(state),
      currentBeat: audioControl.getCurrentBeat(state),
      rowHeight: audioControl.getRowHeight(state)
    };
  },
  dispatch => {
    return {
      updateCurrentBeat(beat: number) {
        dispatch(audioControl.stopPlaying());
        dispatch(audioControl.stopRecording());
        dispatch(audioControl.updateCurrentBeat(beat));
      }
    };
  }
)(Scrubber);
