import * as React from 'react';
import cn from 'classnames';
import ReactToolTip from 'react-tooltip';

export function makeSection(
  el: JSX.Element,
  title?: string,
  className: string = ''
) {
  return [
    <div key={0} className={cn('quickview-item', className)}>
      {title && <strong>{title}</strong>}
      {el}
    </div>,
    <hr key={1} className="divider" />
  ];
}

export function makeButton({
  ref,
  onClick,
  active,
  icon,
  iconClass,
  tooltip,
  keyboardShortcut,
  disabled = false,
  className = '',
  id
}: {
  ref?: any;
  onClick?: any;
  active?: boolean;
  icon: string;
  iconClass?: any;
  disabled?: boolean;
  className?: string;
  tooltip?: string | JSX.Element;
  keyboardShortcut?: string;
  id?: string;
}) {
  return (
    <p id={id} ref={ref} className={cn('control', className)} onClick={onClick}>
      <button
        data-tip
        data-for={icon}
        disabled={disabled}
        className={cn('button', {
          tooltip: !!tooltip,
          'is-dark': active,
          'is-white': !active
        })}
      >
        <span className={cn('icon', { 'has-text-dark': !active })}>
          <i
            className={cn(`fa fa-${icon}`, {
              [iconClass]: true
            })}
          />
        </span>
      </button>

      {tooltip &&
        !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
          <ReactToolTip multiline id={icon} effect="solid" className="content">
            {keyboardShortcut && (
              <strong className="tag">{keyboardShortcut}</strong>
            )}{' '}
            {tooltip}
          </ReactToolTip>
        )}
    </p>
  );
}
