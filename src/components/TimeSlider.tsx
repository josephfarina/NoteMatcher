// FIXME: the sliding behavior is slightly annoying
// it jumps arounda bit to much but isnt to bad
import * as React from 'react';
import { connect } from 'react-redux';
import { AutoSizer } from 'react-virtualized';
import './TimeSlider.css';

import { audioControl } from './../common/state';
const Rnd = require('react-rnd').default;

const resizingOptions = { right: true, left: true };

interface Props {
  allBeats: (width: number) => number[];
  beatsInView: [number, number];
  updateBeatsInView: (beats: [number, number]) => void;
  getBeatNumberOfDrag: (width: number) => (xPos: number) => number;
  beatCount: number;
}

class TimeSlider extends React.PureComponent<Props, {}> {
  private el: HTMLDivElement | null = null;

  render() {
    const {
      beatCount,
      allBeats,
      beatsInView,
      getBeatNumberOfDrag,
      updateBeatsInView
    } = this.props;

    const [startBeat, endBeat] = beatsInView;

    return (
      <AutoSizer>
        {({ width, height }) => {
          const widthOfOneBeat = width / beatCount;
          const widthInBeats = widthOfOneBeat * (endBeat - startBeat);

          const noteTicks: JSX.Element[] = [];
          for (let i = 0; i < beatCount; i++) {
            noteTicks.push(
              <div
                key={i}
                className={`time-slider-beat ${i % 4 === 0 ? 'wide' : ''}`}
                style={{ left: i * widthOfOneBeat }}
              />
            );
          }

          return (
            <div
              ref={ref => (this.el = ref)}
              style={{ width, height }}
              className="time-slider"
              id="timeslider"
            >
              <Rnd
                className="time-slider-dragger"
                size={{ height: '100%', width: widthInBeats }}
                position={{ x: startBeat * widthOfOneBeat, y: 0 }}
                dragGrid={[widthOfOneBeat, height]}
                resizeGrid={[widthOfOneBeat, 0]}
                enableResizing={resizingOptions}
                resizeHandleClasses={{ right: 'time-slider-dragger-handle' }}
                z={1}
                onResize={(e: any) => {
                  // prevent scrolling the underneath layer
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onDragStop={(_: any, d: { x: number; y: number }) => {
                  const newStartBeat = getBeatNumberOfDrag(width)(d.x);
                  const differenceInBeats = newStartBeat - startBeat;
                  const newEndBeat = endBeat + differenceInBeats;
                  const beatDuration = endBeat - startBeat;

                  if (newEndBeat >= allBeats(width).length) {
                    return updateBeatsInView([
                      allBeats(width).length - beatDuration - 1,
                      allBeats(width).length - 1
                    ]);
                  }

                  updateBeatsInView([
                    newStartBeat,
                    endBeat + differenceInBeats
                  ]);
                }}
                onResizeStop={(
                  _: any,
                  __: any,
                  ref: HTMLDivElement,
                  ___: any,
                  position: { x: number; y: number }
                ) => {
                  const elWidth = ref.offsetWidth;
                  const rightDistanceFromEl = position.x + elWidth;

                  const endOfBeat = getBeatNumberOfDrag(width)(
                    rightDistanceFromEl
                  );

                  if (endOfBeat > beatCount) {
                    return;
                  }

                  updateBeatsInView([startBeat, endOfBeat]);
                }}
              />
              {noteTicks}
            </div>
          );
        }}
      </AutoSizer>
    );
  }
}

export default connect(
  (state: StateRoot) => ({
    allBeats: audioControl.getAllBeatXCoordinates(state),
    beatsInView: audioControl.getBeatsInView(state),
    getBeatNumberOfDrag: audioControl.getBeatNumberOfDrag(state),
    beatCount: audioControl.getBeatCount(state)
  }),
  dispatch => ({
    updateBeatsInView(beats: [number, number]) {
      dispatch(audioControl.updateBeatsInView(beats));
    }
  })
)(TimeSlider);
