import * as React from "react";
import { connect } from "react-redux";
import cn from "classnames";
import "./index.css";
import { audioControl } from "./../../common/state";
import { ShareDropdown } from "./Sharing";
import PlayPauseButton from "./PlayPauseButton";
import EditingOptionsButtonBar from "./EditingOptionsButtonBar";
import EllipsisDropdown from "./EllipsisDropdown";
import HelpDropdown from './HelpDropdown';
import QuickView, { QuickViewButton } from "./QuickView";
import { MidiGeneratorDropdown } from "./MidiGenerator";

interface Props {
  gotPermissionForAudio: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  editMode: EditMode;
  changeEditMode: (mode: EditMode) => void;
  askForPermissionForAudio: () => void;
  isMobile: boolean;
}

interface State {
  quickviewOpen: boolean;
}

class PlaybackControls extends React.PureComponent<Props, State> {
  state: State = {
    quickviewOpen: false
  };

  private windowEventListener: (e: any) => any;
  private quickViewContainer: HTMLDivElement | null;
  private quickViewTrigger: HTMLParagraphElement | null;

  componentDidMount() {
    this.windowEventListener = (e: any) => {
      const clickTrigger =
        this.quickViewTrigger && this.quickViewTrigger.contains(e.target);
      const clickQuickview =
        this.quickViewContainer && this.quickViewContainer.contains(e.target);

      if (
        this.quickViewTrigger &&
        this.quickViewContainer &&
        this.state.quickviewOpen
      ) {
        if (clickTrigger) return;
        if (clickQuickview) return;
        this.setState({ quickviewOpen: false });
      }
    };

    window.addEventListener("click", this.windowEventListener);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.windowEventListener);
  }

  render() {
    const {
      editMode,
      changeEditMode,
      gotPermissionForAudio,
      askForPermissionForAudio,
      isMobile
    } = this.props;
    const { quickviewOpen } = this.state;

    if (!gotPermissionForAudio) {
      return (
        <div className="playback-controls playback-controls--center-buttons">
          <p
            id="ask-for-permission-button"
            className="control"
            onClick={askForPermissionForAudio}
            onTouchEnd={e => {
              e.stopPropagation();
              e.preventDefault();
              askForPermissionForAudio();
            }}
          >
            <button className={cn("button is-white", {})}>
              <span className={cn("icon has-text-dark", {})}>
                <i className={cn(`fa fa-microphone`, {})} />
              </span>
              <span>Give Microphone Access</span>
            </button>
          </p>
        </div>
      );
    }

    return (
      <div className="playback-controls">
        <PlayPauseButton />

        <EditingOptionsButtonBar
          changeEditMode={changeEditMode}
          editMode={editMode}
        />

        <div className="field has-addons">
          <MidiGeneratorDropdown />
          <QuickViewButton
            toggleQuickView={() =>
              this.setState(({ quickviewOpen }) => ({
                quickviewOpen: !quickviewOpen
              }))
            }
            quickviewOpen={quickviewOpen}
            getQuickViewTrigger={ref => (this.quickViewTrigger = ref)}
          />

          {!isMobile && <ShareDropdown />}
          {isMobile && <EllipsisDropdown />}

          {!isMobile && <HelpDropdown />}
        </div>

        {quickviewOpen && (
          <QuickView
            getRef={ref => (this.quickViewContainer = ref)}
            onRequestClose={() => this.setState({ quickviewOpen: false })}
          />
        )}
      </div>
    );
  }
}

export default connect(
  (state: StateRoot) => {
    return {
      isRecording: audioControl.getIsRecording(state),
      isPlaying: audioControl.getIsPlaying(state),
      editMode: audioControl.getEditMode(state),
      gotPermissionForAudio: audioControl.getHasPermissionForAudio(state),
      isMobile: state.browser.is.extraSmall
    };
  },
  dispatch => {
    return {
      askForPermissionForAudio() {
        dispatch(audioControl.setUpStreamingAndAudioContext());
      },
      changeEditMode(payload: EditMode) {
        dispatch(audioControl.changeEditMode(payload));
      }
    };
  }
)(PlaybackControls as any);
