import * as React from "react";
import { connect } from "react-redux";
import { notifications } from "./../common/state";
import cn from "classnames";

const browser = function():
  | "Opera"
  | "Firefox"
  | "Safari"
  | "Chrome"
  | "IE"
  | "Edge"
  | "Blink"
  | null {
  // Return cached result if avalible, else get result then cache it.
  if (browser.prototype._cachedResult) return browser.prototype._cachedResult;

  // Opera 8.0+
  var isOpera =
    (!!(window as any).opr && !!(window as any).opr.addons) ||
    !!(window as any).opera ||
    navigator.userAgent.indexOf(" OPR/") >= 0;

  // Firefox 1.0+
  var isFirefox = typeof (window as any).InstallTrigger !== "undefined";

  // Safari 3.0+ "[object HTMLElementConstructor]"
  var isSafari =
    /constructor/i.test((window as any).HTMLElement) ||
    (function(p) {
      return p.toString() === "[object SafariRemoteNotification]";
    })(!(window as any)["safari"] || (window as any).safari.pushNotification) ||
    (navigator.userAgent.toLowerCase().indexOf("safari") !== -1 &&
      navigator.userAgent.toLowerCase().indexOf("chrome") === -1);

  // Internet Explorer 6-11
  var isIE = /*@cc_on!@*/ false || !!(document as any).documentMode;

  // Edge 20+
  var isEdge = !isIE && !!(window as any).StyleMedia;

  // Chrome 1+
  var isChrome = !!(window as any).chrome && !!(window as any).chrome.webstore;

  // Blink engine detection
  var isBlink = (isChrome || isOpera) && !!(window as any).CSS;

  return (browser.prototype._cachedResult = isOpera
    ? "Opera"
    : isFirefox
      ? "Firefox"
      : isSafari
        ? "Safari"
        : isChrome
          ? "Chrome"
          : isIE ? "IE" : isEdge ? "Edge" : isBlink ? "Blink" : null);
};

import "./NotificationCenter.css";

interface Props {
  notifications: NotificationI[];
  removeNotification: (notification: NotificationI) => void;
}

function Message({
  message,
  removeNotification,
  type,
  browserIssue
}: NotificationI & { removeNotification: () => void }) {
  type;
  browserIssue;

  const dangerLevel =
    type === "danger" ? "Error" : type === "warning" ? "Issue" : "";
  const browserMessage =
    browserIssue &&
    (() => {
      switch (browser()) {
        case "Safari":
          return [
            <p>
              It looks like you may be using an older version of Safari. This
              site requires that you update to at least version 11. Prior to
              that version we are unable to access your microphone.
            </p>,
            <p>
              <strong>For iPhones: </strong> to update Safari just install the
              latest software update.
            </p>,
            <p>
              <strong>For Desktops: </strong> We recommend using{" "}
              <a href="https://www.mozilla.org/en-US/firefox/" target="_blank">
                Firefox
              </a>{" "}
              or{" "}
              <a href="https://www.google.com/chrome/browser/desktop/index.html">
                Chrome
              </a>{" "}
              for the most optimal experience.
            </p>
          ];
        case "Chrome":
          return [
            <p>
              It looks like you may be using an outdated version of Chrome that
              doesn't support some of the features that we require in order to
              make this application work properly.
            </p>,
            <p>
              <a href="https://support.google.com/chrome/answer/95414?co=GENIE.Platform%3DDesktop&hl=en">
                Here is a link on how to update.
              </a>
            </p>
          ];
        case "Firefox":
          return [
            <p>
              It looks like you may be using an outdated version of Firefox that
              doesn't support some of the features that we require in order to
              make this application work properly.
            </p>,
            <p>
              <a href="https://support.mozilla.org/en-US/kb/update-firefox-latest-version">
                Here is a link on how to update.
              </a>
            </p>
          ];
        default:
          return (
            <p>
              It looks like you are using an older browser. For the most optimal
              desktop experience we recommend using{" "}
              <a href="https://www.mozilla.org/en-US/firefox/" target="_blank">
                Firefox
              </a>{" "}
              or{" "}
              <a href="https://www.google.com/chrome/browser/desktop/index.html">
                Chrome
              </a>{" "}
            </p>
          );
      }
    })();

  return (
    <article
      className={cn("message", {
        "is-warning": type === "warning",
        "is-danger": type === "danger"
      })}
    >
      <div className="message-header">
        <strong>
          {browserIssue && "Your Browser Is Outdated"}
          {!browserIssue && `An Unexpected ${dangerLevel} Happened`}
        </strong>
        <button
          className="delete"
          aria-label="delete"
          onClick={removeNotification}
        />
      </div>
      <div className="message-body content">
        {message && <p>{message}</p>}
        {browserMessage}
      </div>
    </article>
  );
}

class NotificationCenter extends React.Component<Props, {}> {
  render() {
    const { notifications, removeNotification } = this.props;
    return (
      <div className="notification-center">
        {notifications.map(notification => (
          <Message
            {...notification}
            removeNotification={() => removeNotification(notification)}
          />
        ))}
      </div>
    );
  }
}

export default connect(
  (state: StateRoot) => ({
    notifications: notifications.getNotifications(state)
  }),
  dispatch => ({
    removeNotification(notification: NotificationI) {
      dispatch(notifications.removeNotification(notification));
    }
  })
)(NotificationCenter);
