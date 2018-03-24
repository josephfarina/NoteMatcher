import * as React from 'react';

export default function EmailUsButton({}) {
  return (
    <a
      style={{ width: '100%' }}
      className="button is-info"
      href="mailto:joey@notematcher.com"
    >
      <span className="icon">
        <i className="fa fa-envelope" />
      </span>
      <span>Email Us!</span>
    </a>
  );
}
