import * as React from "react";
import { audioControl } from "./../common/state";
import { connect } from "react-redux";
import Joyride, { Step } from "react-joyride";
import "./Onboarding.css";

const STORAGE_HAS_RAN_ONBOARDING = "note__matcher__onboarding";

interface Props {
  gotPermissionForAudio: boolean;
}

const GIVE_PERMISION: Step = {
  title: "Let's Get Started!",
  selector: "#ask-for-permission-button",
  text: (
    <div className="content">
      <p>
        Before we can move on we need to get permission to access your
        microphone. 
    Please click{" "} the highlighted button
        <button className="button is-small">
          <span className="icon">
            <i className="fa fa-microphone" />
          </span>
          <span>Give Microphone Access</span>
        </button>{" "}
        to get started.
      </p>

      <p>Your privacy is our top concern. We only analyze your voice locally. It never leaves your device.</p>
    </div>
  ),
  isFixed: true,
  allowClicksThruHole: true,
  style: {
    footer: { display: "none" }
  }
};

const PLAY_MODE: Step = {
  title: "Begin and Stop Analyzer",
  text: (
    <div className="content onboarding-step">
      <p>
        Hit{" "}
        <button className="button is-small">
          <i className="fa fa-circle has-text-danger" />
        </button>{" "}
        to begin analyzing your voice. 
        This will start the MIDI playback
        and voice graphing.
      </p>
      <p>
        If you don't immediately see your voice being graphed 
        try finding it by scrolling up or down. 
      </p>
    </div>
  ),
  isFixed: true,
  selector: "#play-pause-button",
  style: { back: { display: "none" } }
};

const EDIT_MODE: Step = {
  title: "MIDI Editing Tools",
  text: (
    <div className="content onboarding-step">
      <p>
        You can create melodies and note sequence to practice singing along with
        using some of our simple MIDI editing tools.
      </p>

      <p>Here is how you do it:</p>

      <hr />

      <div className="onboarding-row">
        <div className="onboarding-button">
          <strong>Draw Mode</strong>
          <button className="button is-small">
            <i className="fa fa-pencil" />
          </button>
        </div>

        <ul>
          <li>Touch and drag to create new notes</li>
          <li>Resize notes by dragging on the right handle</li>
          <li>Reposition notes by dragging them</li>
        </ul>
      </div>

      <hr />

      <div className="onboarding-row">
        <div className="onboarding-button">
          <strong>Erase Mode</strong>
          <button className="button is-small">
            <i className="fa fa-eraser" />
          </button>
        </div>

        <p>
        Click and drag anywhere to erase all notes that overlap 
        with the duration you draw.
        </p>
      </div>

      <hr />

      <div className="onboarding-row">
        <div className="onboarding-button">
          <strong>Drag Mode</strong>
          <button className="button is-small">
            <i className="fa fa-hand-pointer-o" />
          </button>
        </div>
        <p>Prevent editing and allow analyzer to be dragged around</p>
      </div>
    </div>
  ),
  isFixed: true,
  selector: "#editing-options-button-bar"
};

const PREBUILT_SCALE: Step = {
  title: "Prebuilt Scales",
  text: (
    <div className="content onboarding-step">
      <p>
        If you want to practice some scales without having to manually draw them
        in you are in luck. You can select a variety of scales and have them automatically
        drawn in for you here.
      </p>
    </div>
  ),
  isFixed: true,
  selector: "#midi-generator-button"
};

const SETTINGS: Step = {
  title: "Settings",
  text: (
    <div className="content onboarding-step">
      <p>
        The settings panel allows you to control various things. 
        Think of it as a place to manage your playback preferences.
        You can change things like the:
    </p>
      <ul>
        <li>Metronome</li>
        <li>Tempo</li>
        <li>Measures in the project</li>
        <li>Row height</li>
        <li>MIDI Playback Settings and Volume</li>
      </ul>
    </div>
  ),
  isFixed: true,
  selector: "#quick-view-button"
};

const SHARE: Step = {
  title: "Share and Save",
  text: (
    <div className="content onboarding-step">
      <p>
        Here you can get a shareable URL that contains the current state of your
        project. Copy and send it to anyone to share your exact project.
      </p>
      <p>
        The URL in your browser is also updated when ever you make any changes to reflect this share link.
        This allows you to be able to refresh the page without losing any work!
      </p>
    </div>
  ),
  isFixed: true,
  selector: "#share-or-ellipsis-button"
};

const TIMESLIDER: Step = {
  title: "Navigate Through Time",
  text: (
    <div className="content onboarding-step">
      <p>
        Click and drag the handle to zoom the X axis.
      </p>
      <p>
        The markings coordinate with the total beats in your project.
        So, in order to only see 4 beats then drag 
        the handle to the 4th mark from the left
        etc.
      </p>
    </div>
  ),
  isFixed: true,
  selector: "#timeslider"
};

const HELP: Step = {
  title: "Support and Feedback",
  text: (
    <div className="content onboarding-step">
      <p>
        Here you can find some FAQs and answers. 
        Hopefully they help, but if you have any other issues
        please email us and we will
        be more than happy to help. You can find our email in this dropdown.
      </p>
    </div>
  ),
  isFixed: true,
  selector: "#help-button"
};

const STEPS: Step[] = [
  GIVE_PERMISION,
  PLAY_MODE,
  EDIT_MODE,
  TIMESLIDER,
  PREBUILT_SCALE,
  SETTINGS,
  SHARE,
  HELP // TODO: make this work on mobile too
];


// TODO: add last step that says you are ready now! Hit record and sing

class Onboarding extends React.Component<Props, {}> {
  private joyride: Joyride | null;

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.gotPermissionForAudio === true &&
      !this.props.gotPermissionForAudio
    ) {
      this.joyride && this.joyride.next();
    }
  }

  render() {
    return (
      <Joyride
        ref={ref => (this.joyride = ref)}
        run={shouldRunOnboarding()}
        autoStart
        disableOverlay
        type="continuous"
        steps={STEPS}
        callback={({ type }) => {
          if (type === "finished") {
            onboardingComplete();
          }
        }}
      />
    );
  }
}

export default connect(
  (state: StateRoot) => ({
    gotPermissionForAudio: audioControl.getHasPermissionForAudio(state)
  }),
  () => ({})
)(Onboarding);

function shouldRunOnboarding() {
  const local = localStorage.getItem(STORAGE_HAS_RAN_ONBOARDING);
  return !local;
}

function onboardingComplete() {
  localStorage.setItem(STORAGE_HAS_RAN_ONBOARDING, "true");
}
