import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import {selectText} from '../utils/selectText';
import {t} from '../locale';
import AutoSelectText from './autoSelectText';
import Button from './buttons/button';
import Clipboard from './clipboard';
import Confirm from './confirm';
import DropdownReact from './dropdownReact';
import FlowLayout from './flowLayout';
import IconCopy from '../icons/icon-copy';
import IconRefresh from '../icons/icon-refresh';
import LoadingIndicator from './loadingIndicator';
import SpreadLayout from './spreadLayout';
import Switch from './switch';

const BORDER_COLOR = '#dad5df';

class ShareUrlContainer extends React.Component {
  static propTypes = {
    isSharing: PropTypes.bool,
    shareUrl: PropTypes.string,
    onShare: PropTypes.func,
    onConfirming: PropTypes.func,
    onCancel: PropTypes.func,
    busy: PropTypes.bool
  };

  handleCopyClick = () => {
    if (!this.urlRef) return;
    selectText(ReactDOM.findDOMNode(this.urlRef));
  };

  render() {
    let {isSharing, busy, shareUrl, onConfirming, onCancel, onShare} = this.props;
    let url = !busy && isSharing ? shareUrl : 'Not shared';

    return (
      <FlowLayout
        style={{
          flex: 'none',
          alignItems: 'stretch',
          border: `1px solid ${BORDER_COLOR}`,
          borderRadius: 4
        }}>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            backgroundColor: !isSharing ? '#f9f7f9' : 'transparent',
            borderRight: `1px solid ${BORDER_COLOR}`,
            maxWidth: 288
          }}>
          <AutoSelectText
            ref={ref => (this.urlRef = ref)}
            style={{
              flex: 1,
              border: 'none',
              padding: 4,
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}>
            {url}
          </AutoSelectText>
        </div>

        <FlowLayout style={{alignItems: 'stretch'}}>
          <Clipboard hideUnsupported value={url}>
            <Button
              borderless
              size="xsmall"
              onClick={this.handleCopyClick}
              style={{borderRadius: 0, borderRight: `1px solid ${BORDER_COLOR}`}}>
              <IconCopy />
            </Button>
          </Clipboard>

          <Confirm
            message={t(
              'You are about to regenerate a new shared URL. Your previously shared URL will no longer work. Do you want to continue?'
            )}
            onCancel={onCancel}
            onConfirming={onConfirming}
            onConfirm={onShare}>
            <Button borderless size="xsmall">
              <IconRefresh />
            </Button>
          </Confirm>
        </FlowLayout>

      </FlowLayout>
    );
  }
}

const SmallHeading = ({children, ...props}) => (
  <h6
    {...props}
    style={{
      margin: 0,
      paddingRight: 30,
      whiteSpace: 'nowrap'
    }}>
    {children}
  </h6>
);

const IndicatorDot = ({active}) => (
  <span
    style={{
      display: 'inline-block',
      marginRight: 4,
      borderRadius: '50%',
      width: 10,
      height: 10,
      background: active ? '#57be8c' : '#dfdbe4'
    }}
  />
);
IndicatorDot.propTypes = {
  active: PropTypes.bool
};

class ShareIssue extends React.Component {
  static propTypes = {
    isSharing: PropTypes.bool,
    shareUrl: PropTypes.string,
    busy: PropTypes.bool,
    onToggle: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.hasConfirmModal = false;
    this.state = {busy: false};
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.state.busy &&
      (this.props.shareUrl !== nextProps.shareUrl ||
        this.props.isSharing !== nextProps.isSharing)
    ) {
      this.setState({busy: false});
    }
  }

  handleToggleShare = e => {
    e.preventDefault();
    this.setState({busy: true}, () => this.props.onToggle());
  };

  handleShare = () => {
    let {onShare} = this.props;
    this.setState({busy: true}, () => onShare());
    this.hasConfirmModal = false;
  };

  // State of confirm modal so we can keep dropdown menu opn
  handleConfirmCancel = e => (this.hasConfirmModal = false);
  handleConfirmReshare = () => (this.hasConfirmModal = true);

  render() {
    let {className, isSharing} = this.props;
    let {busy} = this.state;
    let cx = classNames('share-issue btn-sm btn btn-default', className);

    let shareTitle = 'Share';

    // Needs to wrap in an inline block for DropdownReact,
    // or else dropdown icon gets wrapped?
    const title = (
      <div style={{marginRight: 4}}>
        <FlowLayout center>
          <IndicatorDot active={isSharing} />
          {shareTitle}
        </FlowLayout>
      </div>
    );

    return (
      <DropdownReact
        className={cx}
        shouldIgnoreClickOutside={() => this.hasConfirmModal}
        title={title}
        keepMenuOpen>
        <li
          style={{
            padding: '12px 18px'
          }}
          ref={ref => (this.container = ref)}>
          <SpreadLayout style={{marginBottom: busy || isSharing ? 12 : undefined}}>
            <SmallHeading>
              {t('Enable public share link')}
            </SmallHeading>
            <Switch isActive={isSharing} size="sm" toggle={this.handleToggleShare} />
          </SpreadLayout>

          {busy &&
            <FlowLayout center>
              <LoadingIndicator mini />
            </FlowLayout>}

          {!busy &&
            isSharing &&
            <ShareUrlContainer
              {...this.props}
              onCancel={this.handleConfirmCancel}
              onConfirming={this.handleConfirmReshare}
              onShare={this.handleShare}
            />}
        </li>
      </DropdownReact>
    );
  }
}

export default ShareIssue;
