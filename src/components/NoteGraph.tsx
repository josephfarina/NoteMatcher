import * as React from "react";
import { connect } from "react-redux";

//import { ANALYZER_LEFT_COL_WIDTH } from "./../constants";
import notes from "./../common/pitch/notes";
import { pitchData, audioControl } from "./../common/state";
import { NoteCanvas, MidiDrawing } from ".";

import "./NoteGraph.css";

interface Props {
  width: number;
  leftOffset: number;
  scrollLeft: number;
  rowHeight: number;
}

const x: any = {};

export default class NoteGraph extends React.Component<Props, {}> {
  shouldComponentUpdate(nextProps: Props) {
    return (
      this.props.width !== nextProps.width ||
      this.props.leftOffset !== nextProps.leftOffset ||
      this.props.rowHeight !== nextProps.rowHeight ||
      this.props.scrollLeft !== nextProps.scrollLeft
    );
  }

  render() {
    const { width, leftOffset, rowHeight, scrollLeft } = this.props;

    return notes.map(({ note }) => {
      const Component: any = connect((state: StateRoot) => {
        return {
          data: pitchData.getNoteSlice(state, note),
          height: rowHeight,
          getXPosition: audioControl.getXPosition(state),
          note
        };
      }, null)(NoteCanvas as any);

      return (
        <div
          key={note}
          className="note-row-canvas-container"
          style={{
            height: rowHeight
          }}
        >
          <Component width={width} />
          <MidiDrawing
            note={note}
            width={width}
            leftOffset={leftOffset}
            scrollLeft={scrollLeft}
            {...x as any}
          />
        </div>
      );
    });
  }
}
