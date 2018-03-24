import * as React from "react";
import { Dropdown } from "../";
import { makeButton } from "./util";
import Faq from './FAQ';
import EmailUsButton from './EmailUsButton';

interface Props { }

export default class EllipsisDropdown extends React.Component<Props, {}> {
  render() {
    return (
      <Dropdown
        clickable
        halfScreen
        right
        button={makeButton({
          icon: "question-circle",
          id: "help-button",
        })}
        content={
          <div className="dropdown-item">
            <EmailUsButton />
            <hr className="divider" />
            <Faq />
          </div>
        }
      />
    );
  }
}

