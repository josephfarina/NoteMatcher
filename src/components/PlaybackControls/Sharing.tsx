import * as React from 'react';
import { getStringifiedStateUrl } from './../../common/state';
const CopyToClipboard = require('react-copy-to-clipboard');
import { connect } from 'react-redux';
import cn from 'classnames';
import { Dropdown } from '../';
import { makeButton } from './util';
//
// todo: make programtic

const CopyShareLink = connect(
  (state: StateRoot) => ({
    shareLink: getStringifiedStateUrl(state)
  }),
  () => ({})
)(
  class CopyShareLink extends React.Component<
    { shareLink: string },
    { copied: boolean }
  > {
    state = { copied: false };

    render() {
      const { shareLink } = this.props;

      return (
        <CopyToClipboard
          text={shareLink}
          onCopy={() => this.setState({ copied: true })}
        >
          <div className="field has-addons">
            <div className="control is-expanded">
              <input
                className="input is-medium"
                value={shareLink}
                readOnly
                onFocus={(e: any) => {
                  e.target.select();
                }}
              />
            </div>

            <div className="control">
              <button
                className={cn('button is-medium', {
                  'is-primary': this.state.copied,
                  'is-info': !this.state.copied
                })}
              >
                {this.state.copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </CopyToClipboard>
      );
    }
  }
);

export { CopyShareLink };

export function ShareDropdown({  }: {}) {
  return (
    <Dropdown
      up
      fullScreen
      right
      button={makeButton({
        id: 'share-or-ellipsis-button',
        icon: 'share'
      })}
      content={
        <div className="dropdown-item content">
          <p>
            {' '}
            <strong>Shareable Link</strong>{' '}
          </p>
          <p>
            This link can be used to save your projects. It saves all the midi,
            tempo, and settings you have selected.
          </p>
          <p>
            It does <strong>not</strong> currently save vocal recordings.
          </p>
          <CopyShareLink />
        </div>
      }
    />
  );
}
