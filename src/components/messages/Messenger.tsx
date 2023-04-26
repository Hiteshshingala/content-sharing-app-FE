import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { deactiveConversation } from '@redux/message/actions';
import ConversationList from './ConversationList';
import MessageList from './MessageList';

import './Messenger.less';

interface IProps {
  toSource?: string;
  toId?: string;
  activeConversation?: any;
  deactiveConversation: Function;
}
class Messenger extends PureComponent<IProps> {
  componentDidMount() {
    const { toSource, toId, deactiveConversation: deactiveConversationHandler } = this.props;
    if (!toSource && !toId) {
      deactiveConversationHandler();
    }
  }

  onClose() {
    const { deactiveConversation: deactiveConversationHandler } = this.props;
    deactiveConversationHandler();
  }

  render() {
    const { toSource, toId, activeConversation } = this.props;
    return (
      <div className="messenger">
        <div className={!activeConversation._id ? 'sidebar' : 'sidebar active'}>
          <ConversationList toSource={toSource} toId={toId} />
        </div>
        <div className={!activeConversation._id ? 'chat-content' : 'chat-content active'}>
          <Button onClick={this.onClose.bind(this)} className="close-btn">Back</Button>
          <MessageList />
        </div>
      </div>
    );
  }
}
const mapStates = (state: any) => {
  const { activeConversation } = state.conversation;
  return {
    activeConversation
  };
};

const mapDispatch = { deactiveConversation };
export default connect(mapStates, mapDispatch)(Messenger);
