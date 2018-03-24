import * as React from "react";
import cn from "classnames";

import "./Radio.css";

interface Props {
  values: string[];
  value: string;
  onChange: (val: string) => any;
  disabled: boolean;
}

export default class Radio extends React.Component<Props, {}> {
  render() {
    const { values, value, onChange, disabled } = this.props;
    return (
      <div className="radio-container">
        {values.map(val => (
          <div
            key={val}
            onClick={() => !disabled && onChange(val)}
            onKeyPress={e => {
              if (e.charCode == 13) {
                e.preventDefault();
                e.stopPropagation();
                !disabled && onChange(val);
              }
            }}
            tabIndex={1}
            className={cn("radio-box", { active: val === value, disabled })}
          >
            {val}
          </div>
        ))}
      </div>
    );
  }
}
