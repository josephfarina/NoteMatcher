import * as React from 'react';
const debounce = require('lodash.debounce');

interface Props {
  width: number;
  step: number;
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => any;
  disabled?: boolean;
  title?: string;
}

export default class Input extends React.Component<Props, { value: number }> {
  state = { value: 0 };

  componentDidMount() {
    this.setState({ value: this.props.value });
    this.onChange = debounce(this.onChange, 50);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  private onChange = () => {
    this.props.onChange(this.state.value);
  };

  render() {
    const { width, step, min, max, disabled, title } = this.props;
    const { value } = this.state;

    return (
      <input
        className="slider is-fullwidth"
        width={'' + width}
        step={'' + step}
        min={'' + min}
        max={'' + max}
        type="range"
        title={title}
        value={value}
        onChange={e => {
          this.setState({ value: +e.target.value }, this.onChange);
        }}
        disabled={disabled}
      />
    );
  }
}
