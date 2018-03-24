import * as React from 'react';
import './Dropdown.css';

import cn from 'classnames';

export default class Dropdown extends React.Component<
  {
    button: JSX.Element;
    content: JSX.Element | JSX.Element[];
    right?: boolean;
    up?: boolean;
    fullScreen?: boolean;
    halfScreen?: boolean;
    className?: string;
    clickable?: boolean;
    fullScreenUpMobile?: boolean; // centers dropdown in the middle of screen on mobile used so it doesnt matter which direction the button is in
  },
  { open: boolean; dropUp: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { open: false, dropUp: false };
  }

  private resizeListener: any;
  private clickListener: any;
  private el: HTMLDivElement | null = null;

  componentDidMount() {
    let passiveSupported = false;

    // detect if passive event listeners are supoprted
    try {
      const options = Object.defineProperty({}, 'passive', {
        get: function() {
          passiveSupported = true;
        }
      });

      window.addEventListener('test', null as any, options);
    } catch (err) {}

    this.resizeListener = () => {
      if (this.ref) {
        const { top } = this.ref.getBoundingClientRect();

        if (top > window.innerHeight - top) {
          this.setState({ dropUp: true });
        } else {
          this.setState({ dropUp: false });
        }
      }
    };

    this.resizeListener();

    window.addEventListener('resize', this.resizeListener, (passiveSupported
      ? { passive: true }
      : false) as any);

    this.clickListener = (e: any) => {
      if (this.el && this.el.contains(e.target)) return;

      this.close();
    };

    window.addEventListener('click', this.clickListener);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
    window.removeEventListener('click', this.clickListener);
  }

  private ref: HTMLDivElement | null = null;

  public close = () => {
    this.setState({ open: false });
  };

  render() {
    const {
      button,
      content,
      right,
      halfScreen,
      fullScreen,
      className,
      clickable,
      fullScreenUpMobile
    } = this.props;

    return (
      <div
        ref={ref => (this.el = ref)}
        className={cn('dropdown', className, {
          'is-active': clickable && this.state.open,
          'is-hoverable': !clickable,
          'is-right': right,
          'is-up': this.state.dropUp
        })}
      >
        <div
          ref={ref => (this.ref = ref)}
          className="dropdown-trigger"
          onClick={() => this.setState(({ open }) => ({ open: !open }))}
        >
          {button}
        </div>
        <div
          className={cn('dropdown-menu', {
            'dropdown--full-screen-up': fullScreenUpMobile,
            'dropdown--full-screen': fullScreen,
            'dropdown--half-screen': halfScreen
          })}
        >
          <div className="dropdown-content">{content}</div>
        </div>
      </div>
    );
  }
}
