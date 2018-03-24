import * as React from 'react';
import { connect } from 'react-redux';
import { audioControl } from './../common/state';
import { MidiOverlay } from '.';
import { MidiOverlay as PureMidiOverlay } from './MidiOverlay';
import cn from 'classnames';

import './MidiDrawing.css';
// TODO: DO NOT HAVE TO USE THIS -- but make sure to update it if class name
// chnages
const MIDI_DRAWING_ELEMENT_CONTAINER_CLASS_NAME = '.midi-drawing';

interface Props {
  note: Note;
  width: number;
  getBeatNumberOfDrag: (xPos: number) => number;
  widthOfOneBeatInPixels: number;
  addMidiNote: (note: Note, beats: [number, number]) => void;
  deleteMidiNote: (note: Note, beats: [number, number]) => void;
  children?: React.ReactChildren;
  leftOffset: number;
  scrollLeft: number;
  editMode: EditMode;
}

interface State {
  mouseDown?: boolean;
  selectedBeat?: [number, number] | null;
}

class MidiDrawing extends React.PureComponent<Props, State> {
  state: State = { mouseDown: false, selectedBeat: null };

  private midiOverlay: PureMidiOverlay | null = null;

  render() {
    const {
      getBeatNumberOfDrag,
      widthOfOneBeatInPixels,
      addMidiNote,
      deleteMidiNote,
      note,
      width,
      leftOffset,
      editMode
    } = this.props;
    const { selectedBeat } = this.state;

    const isDrawingMode = editMode === 'draw';
    const isEraseMode = editMode === 'erase';

    function intendedPageClick(e: any): number {
      // FIXME: THIS IS A HACK TO GET THE OFFSET OF A PARTICUL DOM NODE
      // I DONT REALLY WNAT TO DO IT BUT USING event.target GIVES UNRELIABLE
      // RESULTS SINCE SOMETIMES OTHER ELEMENTS ARE CLICKED
      // FIX ME ONE DAY BUT PASSING DOWN A PROP OR SOMETHING
      const midiDrawingEl = document.querySelector(
        MIDI_DRAWING_ELEMENT_CONTAINER_CLASS_NAME
      );
      let elLeftOffset = 0;
      if (midiDrawingEl) {
        elLeftOffset = midiDrawingEl.getBoundingClientRect().left;
      }

      const actualLeftPosition = Math.abs(elLeftOffset - leftOffset);
      const actualPageClick = pageXFromEvent(e) - leftOffset;
      return actualPageClick + actualLeftPosition;
    }

    function detectMoreThanOneFinger(e: any) {
      if (e.touches && e.touches.length > 1) {
        return true;
      }

      return false;
    }

    const endFunc = (e: any) => {
      if (detectMoreThanOneFinger(e)) return;
      if (editMode === null) return;

      e.preventDefault();

      if (Array.isArray(selectedBeat)) {
        if (isDefined(selectedBeat[0]) && isDefined(selectedBeat[1])) {
          if (isDrawingMode) {
            addMidiNote(note, selectedBeat as [number, number]);
          }

          if (isEraseMode) {
            deleteMidiNote(note, selectedBeat as [number, number]);
          }
        }
      }

      this.setState({ mouseDown: false, selectedBeat: null });
    };

    const startFunc = (e: any) => {
      if (detectMoreThanOneFinger(e)) return;
      if (editMode === null) return;

      if (isDrawingMode) {
        if (
          this.midiOverlay &&
          !this.midiOverlay.checkIfClickingOnABeat(intendedPageClick(e))
        ) {
          this.setState({ mouseDown: true });
        }
      } else if (isEraseMode) {
        // allow drawing on other notes when erasing
        this.setState({ mouseDown: true });
      }
    };

    const moveFunc = (e: any) => {
      if (detectMoreThanOneFinger(e)) return;
      if (editMode === null) return;

      if (isDrawingMode || isEraseMode) {
        e.preventDefault();

        if (this.state.mouseDown) {
          const beat = getBeatNumberOfDrag(intendedPageClick(e));
          if (Array.isArray(selectedBeat)) {
            let previousStart = selectedBeat[0]!;

            if (beat === previousStart) return;

            if (beat < previousStart) {
              this.setState({ selectedBeat: [beat, previousStart] });
            } else if (beat > previousStart) {
              this.setState({ selectedBeat: [previousStart, beat] });
            }
          } else {
            // neither selected
            this.setState({ selectedBeat: [beat, beat + 1] });
          }
        }
      }
    };

    return (
      <div
        style={{ width }}
        className="midi-drawing" // if this is changed make sure to change MIDI_DRAWING_ELEMENT_CONTAINER_CLASS_NAME
        onTouchStart={startFunc}
        onMouseDown={startFunc}
        onTouchEnd={endFunc}
        onMouseUp={endFunc}
        onMouseLeave={endFunc}
        onTouchMove={moveFunc}
        onMouseMove={moveFunc}
      >
        {Array.isArray(selectedBeat) && (
          <div
            className={cn('midi-drawing-item', { erase: isEraseMode })}
            style={{
              left: selectedBeat[0]! * widthOfOneBeatInPixels,
              width:
                (selectedBeat[1]! - selectedBeat[0]!) * widthOfOneBeatInPixels
            }}
          />
        )}

        <MidiOverlay
          getRef={ref => (this.midiOverlay = ref)}
          note={note}
          width={width}
          {...{} as any}
        />
      </div>
    );
  }
}

export default connect(
  (state: StateRoot, ownProps: Props) => ({
    widthOfOneBeatInPixels: audioControl.getWidthOfOneBeatInPixels(state)(
      ownProps.width
    ),
    getBeatNumberOfDrag: audioControl.getBeatNumberOfDrag(state)(
      ownProps.width
    ),
    editMode: audioControl.getEditMode(state)
  }),
  dispatch => ({
    addMidiNote(note: Note, beats: [number, number]) {
      const [startBeat, endBeat] = beats;
      const duration = endBeat - startBeat;
      if (Number.isInteger(duration)) {
        dispatch(audioControl.addMidiNote(note, startBeat, duration));
      }
    },
    deleteMidiNote(note: Note, beats: [number, number]) {
      const [startBeat, endBeat] = beats;
      const duration = endBeat - startBeat;
      if (Number.isInteger(duration)) {
        dispatch(audioControl.deleteMidiNote(note, startBeat, duration));
      }
    }
  })
)(MidiDrawing);

function isDefined(num: number | undefined): boolean {
  return typeof num !== undefined;
}

function pageXFromEvent(e: any): number {
  let pageX = e.pageX;

  if (typeof e.changedTouches !== 'undefined') {
    pageX = e.changedTouches[0].pageX;
  }

  return pageX;
}
