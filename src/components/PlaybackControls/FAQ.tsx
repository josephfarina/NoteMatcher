import * as React from 'react';

class Faq extends React.Component<
  {},
  {
    openState: { [id: string]: boolean };
  }
> {
  state = { openState: {} as any };

  render() {
    const { openState } = this.state;
    return (
      <div>
        <article className="message is-info">
          <div
            onClick={() =>
              this.setState(({ openState }) => ({
                openState: { ...openState, one: !openState.one }
              }))
            }
            className="message-header clickable"
          >
            Voice isn’t being graphed after not using the site for a bit.
          </div>
          {openState.one && (
            <div className="message-body">
              Unfortunately the browser sometimes revokes access to the
              microphone after navigating away. The current recommended solution
              is to just refresh the page. Make sure to copy the share link
              before you refresh to save any work.
            </div>
          )}
        </article>

        <article className="message is-info">
          <div
            onClick={() =>
              this.setState(({ openState }) => ({
                openState: { ...openState, two: !openState.two }
              }))
            }
            className="message-header clickable"
          >
            Can't get voice graphing to work and it never has
          </div>
          {openState.two && (
            <div className="message-body">
              Please make sure you are using the latest Firefox or Chrome
              desktop browser. If you are on an iPhone please make sure you have
              at least iOS 11 installed.
            </div>
          )}
        </article>

        <article className="message is-info">
          <div
            onClick={() =>
              this.setState(({ openState }) => ({
                openState: { ...openState, three: !openState.three }
              }))
            }
            className="message-header clickable"
          >
            Voice graphing isn't working now, but it has before
          </div>
          {openState.three && (
            <div className="message-body">
              Please try refreshing the browser and trying again. If that still
              doesn’t fix the problem try clearing your browser history for this
              webpage or attempting to use the site in private mode.
            </div>
          )}
        </article>
      </div>
    );
  }
}

export default function FAQ() {
  return (
    <div className="quickview-item">
      <h5 className="title is-5">TroubleShooting</h5>
      <Faq />
    </div>
  );
}
