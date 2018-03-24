import * as React from "react";
import { connect } from "react-redux";
import "./MidiOverlay.css";

import { audioControl } from "./../common/state";
const Rnd = require("react-rnd").default;

interface Props {
  width: number;
  note: Note;

  widthOfOneBeatInPixels: number;
  allBeats: (width: number) => number[];
  getBeatNumberOfDrag: (xPos: number) => number;
  midi: MidiNote[];
  measures: number;

  getRef: (ref: MidiOverlay) => void;

  editMidiNote: (
    originalBeat: MidiNote,
    note: Note,
    startBeat: number,
    durationInBeats: number
  ) => void;
  deleteMidiNote: (beat: MidiNote) => void;
  editMode: EditMode;
}

const resizingOptions = { right: true };

class MidiOverlay extends React.Component<Props, {}> {
  componentDidMount() {
    if (this.props.getRef) {
      this.props.getRef(this);
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    return (
      this.props.midi !== nextProps.midi ||
      this.props.width !== nextProps.width ||
      this.props.editMode !== nextProps.editMode ||
      this.props.measures !== nextProps.measures
    );
  }

  public checkIfClickingOnABeat = (x: number) => {
    const { widthOfOneBeatInPixels, midi } = this.props;
    return (
      midi
        .map((beat, i) => {
          if (Array.isArray(beat)) {
            const leftPosition = widthOfOneBeatInPixels * i;
            const rightPosition =
              leftPosition + widthOfOneBeatInPixels * beat[1];
            if (x >= leftPosition && x < rightPosition) {
              return true;
            }

            return false;
          }

          return false;
        })
        .filter(Boolean).length > 0
    );
  };

  render() {
    const {
      widthOfOneBeatInPixels,
      getBeatNumberOfDrag,
      midi,
      note,
      editMidiNote,
      editMode
    } = this.props;

    const editMidiNotesMode = editMode === "draw";

    const midiDisplay = midi.map((beat, i) => {
      if (Array.isArray(beat)) {
        const leftPosition = widthOfOneBeatInPixels * i;
        const widthOfNote = widthOfOneBeatInPixels * beat[1];

        return (
          <Rnd
            key={i}
            className="midi-item"
            size={{ height: "100%", width: widthOfNote }}
            position={{ x: leftPosition, y: 0 }}
            dragGrid={[widthOfOneBeatInPixels, 50]}
            resizeGrid={[widthOfOneBeatInPixels, 0]}
            disableDragging={!editMidiNotesMode}
            resizeHandleClasses={{ right: "midi-item-drag-handle" }}
            enableResizing={editMidiNotesMode && resizingOptions}
            z={1}
            onDragStop={(_: any, d: { x: number; y: number }) => {
              if (!editMidiNotesMode) return;
              editMidiNote(beat, note, getBeatNumberOfDrag(d.x), beat[1]);
            }}
            onResizeStop={(
              _: any,
              __: any,
              ref: HTMLDivElement,
              ___: any,
              position: { x: number; y: number }
            ) => {
              if (!editMidiNotesMode) return;
              const width = ref.offsetWidth;
              const endOfBeat = getBeatNumberOfDrag(position.x + width);
              editMidiNote(beat, note, i, endOfBeat - i);
            }}
          >
            <span className="midi-item-content">
              <span>{beat[0]}</span>
            </span>
          </Rnd>
        );
      }

      return null;
    });

    return midiDisplay as any;
  }
}

export default connect(
  (state: StateRoot, ownProps: Props) => ({
    widthOfOneBeatInPixels: audioControl.getWidthOfOneBeatInPixels(state)(
      ownProps.width
    ),
    allBeats: audioControl.getAllBeatXCoordinates(state),
    getBeatNumberOfDrag: audioControl.getBeatNumberOfDrag(state)(
      ownProps.width
    ),
    midi: audioControl.getMidiValuesByNote[ownProps.note](state),
    editMode: audioControl.getEditMode(state),
    measures: audioControl.getMeasures(state)
  }),
  dispatch => {
    return {
      editMidiNote(
        originalBeat: MidiNote,
        note: Note,
        startBeat: number,
        durationInBeats: number
      ) {
        dispatch(
          audioControl.editMidiNote(
            originalBeat,
            note,
            startBeat,
            durationInBeats
          )
        );
      }
    };
  }
)(MidiOverlay);
export { MidiOverlay };
