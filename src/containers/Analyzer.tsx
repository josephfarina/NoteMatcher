import * as React from 'react';
import notes, { INDEX_MAP_BY_NOTE } from './../common/pitch/notes';
import cn from 'classnames';
import { connect } from 'react-redux';
import { audioControl } from './../common/state';
import { AutoSizer } from 'react-virtualized';

const throttle = require('lodash.throttle');

import './Analyzer.css';

import {
  BeatMarkers,
  NoteGraph,
  PlaybackControls,
  Scrubber,
  TimeSlider
} from './../components';

interface Props {
  beatCount: number;
  beatsInView: [number, number];
  changeEditMode: (mode: EditMode) => void;
  currentBeat: number;
  dispatch?: (action: any) => any;
  isRecordingOrPlaying: boolean;
  lastNoteRecorded: Note | null;
  midi: MidiNote[];
  rowHeight: number;
  toggleRecording: () => void;
  updateBeatsInView: (beats: [number, number]) => void;
}

const NAV_HEIGHT = 75;

class Analyzer extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.scrollYToNote = throttle(this.scrollYToNote, 50);
  }

  private analyzerContainerEl: HTMLDivElement | null = null;
  private autoSizerRef: any;
  private containerEl: HTMLDivElement | null = null;
  private globalKeyListener: (e: KeyboardEvent) => void = () => undefined;
  private leftOffset = 100;

  componentDidMount() {
    const { toggleRecording, changeEditMode } = this.props;

    this.globalKeyListener = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        const key = e.keyCode || e.charCode;

        const actions: { [key: number]: () => void } = {
          [18]: toggleRecording, // CTRL - R
          [8]: () => changeEditMode(null), // CTRL - H
          [4]: () => changeEditMode('draw'), // CTRL - D
          [5]: () => changeEditMode('erase') // CTRL - E
        };

        if (Object.keys(actions).includes('' + key)) {
          e.preventDefault();
          e.stopPropagation();
          actions[key]();
        } else {
          return;
        }
      }
    };

    window.addEventListener('keypress', this.globalKeyListener);

    let firstNoteFound: MidiNote;
    for (let i = 0; i < this.props.midi.length; i++) {
      if (Array.isArray(this.props.midi[i])) {
        console.log(i);
        firstNoteFound = this.props.midi[i];
        break;
      }
    }

    setTimeout(
      () =>
        window.requestAnimationFrame(() => this.scrollYToNote(firstNoteFound)),
      100
    ); // make sure page is actually loaded
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this.globalKeyListener);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.currentBeat !== this.props.currentBeat) {
      const duration = nextProps.beatsInView[1] - nextProps.beatsInView[0];
      const durationHalf = Math.ceil(duration / 2);

      let nextStartBeat = nextProps.currentBeat - durationHalf;
      if (nextStartBeat < 0) {
        nextStartBeat = 0;
      }

      let nextEndBeat = nextStartBeat + duration;
      if (nextEndBeat > nextProps.beatCount) {
        nextEndBeat = nextProps.beatCount;
        nextStartBeat = nextEndBeat - duration;
      }

      this.props.updateBeatsInView([nextStartBeat, nextStartBeat + duration]);
    }

    if (nextProps.beatsInView !== this.props.beatsInView) {
      if (this.containerEl) {
        this.containerEl.scrollLeft =
          this.getSingleBeatWidth(this.getWidth(), nextProps) *
          nextProps.beatsInView[0];
      }
    }

    const currentNote = nextProps.midi[nextProps.currentBeat];
    if (currentNote && nextProps.isRecordingOrPlaying) {
      window.requestAnimationFrame(() =>
        this.scrollYToNote(currentNote, nextProps)
      );
    }
  }

  private scrollYToNote = (
    currentNote: MidiNote,
    nextProps: Props = this.props
  ) => {
    console.log(currentNote, 'scrollYToNote');
    if (this.analyzerContainerEl) {
      const noteIndex = INDEX_MAP_BY_NOTE[currentNote![0]];
      const height = window.innerHeight - NAV_HEIGHT;
      const rowsInView = height / nextProps.rowHeight;
      const halfWay = rowsInView / 2;
      const scrollNode = document.scrollingElement || document.documentElement;
      scrollNode.scrollTop = (noteIndex - halfWay) * nextProps.rowHeight;
    }
  };

  private getWidth = (): number => {
    return this.autoSizerRef ? this.autoSizerRef.state.width : 0;
  };

  private getSingleBeatWidth = (width: number, props?: Props): number => {
    const { beatsInView } = props || this.props;
    return (width - this.leftOffset) / (beatsInView[1] - beatsInView[0]);
  };

  render() {
    const { beatCount, isRecordingOrPlaying, rowHeight } = this.props;

    return (
      <div style={{ width: '100vw' }}>
        <AutoSizer
          ref={(autoSizerRef: any) => (this.autoSizerRef = autoSizerRef)}
          disableHeight
        >
          {({ width }) => {
            if (width > 1000) {
              this.leftOffset = 100;
            } else {
              this.leftOffset = 50;
            }

            let analyzerScollLeft = 0;
            if (this.containerEl) {
              analyzerScollLeft = this.containerEl.scrollLeft;
            }

            const leftColStyle = {
              minWidth: this.leftOffset,
              maxWidth: this.leftOffset, // make sure it is exactly 100px
              width: '100%'
            };

            width = this.getSingleBeatWidth(width) * beatCount;

            return [
              <div key={0} className="controls-bar">
                <PlaybackControls />
              </div>,

              <div key={1} className="time-bar">
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    ...leftColStyle
                  }}
                >
                </div>
                <div style={{ height: '100%', width: '100%' }}>
                  <TimeSlider />
                </div>
              </div>,

              <div
                key={2}
                ref={ref => (this.analyzerContainerEl = ref)}
                className={cn('analyzer-container', {
                  'disable-scrolling': isRecordingOrPlaying
                })}
              >
                <div style={leftColStyle} className="analyzer-left-col">
                  {notes.map(({ note }) => {
                    const isSharp = note.includes('#');

                    return (
                      <div
                        key={note}
                        style={{ height: rowHeight }}
                        onClick={() => audioControl.playNote(note)}
                        className={cn('piano-key', {
                          black: isSharp,
                          white: !isSharp,
                          'large-text': rowHeight >= 40,
                          'small-text': rowHeight > 20 && rowHeight < 40,
                          'tiny-text': rowHeight <= 20
                        })}
                      >
                        {note}
                      </div>
                    );
                  })}
                </div>

                <div
                  className="analyzer-right-col"
                  ref={ref => (this.containerEl = ref)}
                >
                  <NoteGraph
                    rowHeight={rowHeight}
                    leftOffset={this.leftOffset}
                    scrollLeft={analyzerScollLeft}
                    width={width}
                  />
                  <Scrubber width={width} />
                  <BeatMarkers width={width} />
                </div>
              </div>
            ];
          }}
        </AutoSizer>
      </div>
    );
  }
}

export default connect(
  (state: StateRoot) => ({
    beatCount: audioControl.getBeatCount(state),
    beatsInView: audioControl.getBeatsInView(state),
    currentBeat: audioControl.getCurrentBeat(state),
    isRecordingOrPlaying: audioControl.getIsRecording(state) || audioControl.getIsPlaying(state),
    lastNoteRecorded: audioControl.getLastNoteRecorded(state),
    midi: audioControl.getMidi(state),
    rowHeight: audioControl.getRowHeight(state),
  }),
  dispatch => ({
    changeEditMode(mode: EditMode) { dispatch(audioControl.changeEditMode(mode)); },
    toggleRecording() { dispatch(audioControl.toggleRecording()); },
    updateBeatsInView(beats: [number, number]) { dispatch(audioControl.updateBeatsInView(beats)); },
  })
)(Analyzer);
