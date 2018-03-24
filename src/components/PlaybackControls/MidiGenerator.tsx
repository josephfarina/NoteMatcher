import * as React from "react";
import notes from "./../../common/pitch/notes";
import * as MusicMath from "./../../common/musicMath";
import { audioControl } from "./../../common/state";
import { connect } from "react-redux";
import cn from "classnames";
import { Dropdown } from "../";
import { makeButton } from "./util";
import "./MidiGenerator.css";
const Fuse = require("fuse.js");

interface MidiGeneratorState {
  search: string;
  tab: ScaleType;
}

type ScaleType = "Major" | "Minor" | "all";

const MidiGenerator = connect(
  () => ({}),
  dispatch => ({
    generateScale(note: Note, scaleType: ScaleType) {
      let scale: (Note | undefined)[];
      if (scaleType === "Major") {
        scale = MusicMath.getMajorScale(note);
      } else if (scaleType === "Minor") {
        scale = MusicMath.getMinorScale(note);
      } else {
        return;
      }

      const midi = MusicMath.buildMidiFromScale(scale);
      dispatch(audioControl.updateMidiValues(midi));
      dispatch(audioControl.updateMeasuresToFitBeatCount(midi.length));
    }
  })
)(
  class MidiGenerator extends React.Component<
    {
      limitHeight?: boolean;
      generateScale: (note: Note, scaleType: ScaleType) => any;
      onClick?: () => any;
    },
    MidiGeneratorState
  > {
    state: MidiGeneratorState = { search: "", tab: "all" };

    render() {
      const { generateScale } = this.props;
      let currNotes: {
        note: Note;
        scale: ScaleType;
      }[] = notes.reduce((acc, { note }) => {
        let scales: ScaleType[] = [this.state.tab];

        if (this.state.tab === "all") {
          scales = ["Major", "Minor"];
        }

        return [...acc, ...scales.map(scale => ({ scale, note }))];
      }, []);

      currNotes = [...currNotes].reverse();

      if (this.state.search.length > 0) {
        currNotes = new Fuse(currNotes, {
          keys: ["note"],
          tokenize: true,
          threshold: 0.6
        }).search(this.state.search);
      }

      return (
        <nav className="panel">
          <p className="panel-heading">Prebuilt Melodies and Scales</p>

          <div className="panel-block">
            <p className="control has-icons-left">
              <input
                value={this.state.search}
                onChange={e => this.setState({ search: e.target.value })}
                className="input "
                type="text"
                placeholder="search"
              />
              <span className="icon  is-left">
                <i className="fa fa-search" />
              </span>
            </p>
          </div>

          <p className="panel-tabs">
            <a
              onClick={() => this.setState({ tab: "all" })}
              className={cn({ "is-active": this.state.tab === "all" })}
            >
              All
            </a>
            <a
              onClick={() => this.setState({ tab: "Major" })}
              className={cn({ "is-active": this.state.tab === "Major" })}
            >
              Major Scale
            </a>
            <a
              onClick={() => this.setState({ tab: "Minor" })}
              className={cn({ "is-active": this.state.tab === "Minor" })}
            >
              Minor Scale
            </a>
          </p>

          <div className="midi-generator-item-container">
            {currNotes.map(({ scale, note }) => (
              <PanelItem
                onClick={() => {
                  generateScale(note, scale);
                  this.props.onClick && this.props.onClick();
                }}
                icon="music"
                note={note}
                scale={scale}
              />
            ))}
          </div>
        </nav>
      );
    }
  }
);

function PanelItem({
  icon,
  note,
  scale,
  onClick
}: {
  icon: string;
  note: Note;
  scale: ScaleType;
  onClick: () => any;
}) {
  return (
    <a onClick={onClick} className="panel-block midi-generator-item">
      <div className="midi-generator-item-note">
        <span className="panel-icon">
          <i className={`fa fa-${icon}`} />
        </span>
        {note}
      </div>
      <span
        className={cn("tag", {
          "is-dark": scale === "Minor",
          "is-light": scale === "Major"
        })}
      >
        {scale}
      </span>
    </a>
  );
}

export { MidiGenerator };

export class MidiGeneratorDropdown extends React.Component<{}, {}> {
  private dropdown: Dropdown | null;

  render() {
    return (
      <Dropdown
        ref={ref => (this.dropdown = ref)}
        halfScreen
        right
        clickable
        fullScreenUpMobile
        button={makeButton({
          icon: "music",
          id: "midi-generator-button",
          tooltip: "Prebuilt scales and melodies that you can load instantly"
        })}
        content={
          <div className="dropdown-item">
            <MidiGenerator
              onClick={() => {
                this.dropdown && this.dropdown.close();
              }}
            />
          </div>
        }
      />
    );
  }
}
