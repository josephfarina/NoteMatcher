import * as React from "react";
import { connect } from "react-redux";
import { audioControl } from "./../common/state";
import notes from "./../common/pitch/notes";

import "./BeatMarkers.css";

interface Props {
  getAllBeatXCoordinates: (width: number) => number[];
  width: number;
  rowHeight: number;
}

class BeatMarkers extends React.PureComponent<Props, {}> {
  render() {
    const { getAllBeatXCoordinates, width, rowHeight } = this.props;

    return getAllBeatXCoordinates(width).map((x, i) => {
      return (
        <div
          key={i}
          className="beat-marker"
          style={{
            left: Math.round(x),
            height: rowHeight * notes.length,
            width: i % 4 === 0 ? 2 : 1
          }}
        />
      );
    });
  }
}

export default (connect as any)(
  (state: StateRoot) => ({
    getAllBeatXCoordinates: audioControl.getAllBeatXCoordinates(state),
    rowHeight: audioControl.getRowHeight(state)
  }),
  () => ({})
)(BeatMarkers);
