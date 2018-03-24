import * as React from "react";
import { makeButton } from "./util";

export default function EditingOptionsButtonBar({
  changeEditMode,
  editMode
}: {
  changeEditMode: (mode: EditMode) => void;
  editMode: EditMode;
}) {
  return (
    <div id="editing-options-button-bar" className="field has-addons">
      {makeButton({
        onClick: () => {
          changeEditMode(null);
        },
        active: editMode === null,
        icon: "hand-pointer-o",
        keyboardShortcut: "CTRL-H",
        tooltip:
          "This mode lets you drag and move around the chart and prevents the editing of any MIDI"
      })}

      {makeButton({
        onClick: () => {
          if (editMode === "draw") {
            changeEditMode(null);
          } else {
            changeEditMode("draw");
          }
        },
        active: editMode === "draw",
        icon: "pencil",
        keyboardShortcut: "CTRL-D",
        tooltip: "This mode lets you both resize, drag, and draw in MIDI notes."
      })}

      {makeButton({
        onClick: () => {
          if (editMode === "erase") {
            changeEditMode(null);
          } else {
            changeEditMode("erase");
          }
        },
        active: editMode === "erase",
        icon: "eraser",
        keyboardShortcut: "CTRL-E",
        tooltip:
          "This mode lets you erase already drawn MIDI. Just drag over any notes you would like to erase."
      })}
    </div>
  );
}
