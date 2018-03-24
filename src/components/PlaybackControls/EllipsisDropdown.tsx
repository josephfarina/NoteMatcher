import * as React from "react";
//import { connect } from "react-redux";
//import cn from "classnames";
import { Dropdown } from "../";
import { makeButton } from "./util";
import { CopyShareLink } from "./Sharing";
import Faq from './FAQ';
import EmailUsButton from './EmailUsButton';

interface Props {}

export default class EllipsisDropdown extends React.Component<Props, {}> {
  //private dropdown: Dropdown | null;
  render() {
    return (
      <Dropdown
        clickable
        fullScreen
        right
        button={makeButton({
          icon: "ellipsis-v",
          id: "share-or-ellipsis-button"
          //className: "is-hidden-tablet"
        })}
        content={
          <div className="dropdown-item">
            <EmailUsButton />
            <hr className="divider" />
            <strong>Shareable Link</strong>
            <CopyShareLink />
            <hr className="divider" />
            <Faq />
          </div>
        }
      />
    );
  }
}
