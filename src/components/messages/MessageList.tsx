import React, { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { loadMoreMessages } from '@redux/message/actions';
import Compose from './Compose';
import Message from './Message';

import './MessageList.less';

interface IProps {
  loadMoreMessages: Function;
  message: any;
  conversation: any;
  currentUser: any;
  messagesRef: any;
}

class MessageList extends PureComponent<IProps> {
  messagesRef: any;

  state = {
    offset: 1,
    onloadmore: false
    // activeConversationId: null
  };

  async componentDidMount() {
    if (!this.messagesRef) this.messagesRef = createRef();
  }

  async componentDidUpdate(prevState) {
    const { conversation } = this.props;
    if (
      prevState &&
      prevState.conversation &&
      prevState.conversation._id !== conversation._id
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        offset: 1
        // activeConversationId: conversation._id
      });
    }
  }

  renderMessages = () => {
    const { message, currentUser, conversation } = this.props;
    const recipientInfo = conversation && conversation.recipientInfo;
    const messages = message.items;
    let i = 0;
    const messageCount = messages.length;
    const tempMessages = [];
    while (i < messageCount) {
      const previous = messages[i - 1];
      const current = messages[i];
      const next = messages[i + 1];
      const isMine = current.senderId === currentUser._id;
      const currentMoment = moment(current.createdAt);
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startsSequence = true;
      let endsSequence = true;
      let showTimestamp = true;

      if (previous) {
        const previousMoment = moment(previous.createdAt);
        const previousDuration = moment.duration(
          currentMoment.diff(previousMoment)
        );
        prevBySameAuthor = previous.senderId === current.senderId;

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false;
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false;
        }
      }

      if (next) {
        const nextMoment = moment(next.createdAt);
        const nextDuration = moment.duration(nextMoment.diff(currentMoment));
        nextBySameAuthor = next.senderId === current.senderId;

        if (nextBySameAuthor && nextDuration.as('hours') < 1) {
          endsSequence = false;
        }
      }
      if (current._id) {
        tempMessages.push(
          <Message
            key={i}
            isMine={isMine}
            startsSequence={startsSequence}
            endsSequence={endsSequence}
            showTimestamp={showTimestamp}
            data={current}
            recipient={recipientInfo}
            currentUser={currentUser}
          />
        );
      }
      // Proceed to the next message.
      i += 1;
    }
    this.scrollToBottom();
    return tempMessages;
  };

  scrollToBottom() {
    const { onloadmore } = this.state;
    if (onloadmore) {
      return;
    }
    if (this.messagesRef && this.messagesRef.current) {
      const ele = this.messagesRef.current;
      window.setTimeout(() => {
        ele.scrollTop = ele.scrollHeight;
      }, 300);
    }
  }

  async handleScroll(conversation, event) {
    const { message, loadMoreMessages: loadMoreMessagesHandler } = this.props;
    const { offset } = this.state;
    const { fetching, items, total } = message;
    const canloadmore = total > items.length;
    const ele = event.target;
    if (!canloadmore) return;
    if (ele.scrollTop === 0 && conversation._id && !fetching && canloadmore) {
      await this.setState({ offset: offset + 1, onloadmore: true });
      loadMoreMessagesHandler({
        conversationId: conversation._id,
        limit: 50,
        offset: (offset - 1) * 50
      });
    }
  }

  render() {
    const { conversation, message } = this.props;
    // const { isSubscribed } = this.state;
    const { fetching } = message;
    if (!this.messagesRef) this.messagesRef = createRef();
    return (
      <div
        className="message-list"
        ref={this.messagesRef}
        onScroll={this.handleScroll.bind(this, conversation)}
      >
        {conversation && conversation._id ? (
          <>
            <div className="message-list-container">
              {conversation && conversation.recipientInfo && (
                <div className="mess-recipient">
                  <img
                    alt="avatar"
                    src={conversation.recipientInfo.avatar || '/no-avatar.png'}
                  />{' '}
                  {conversation.recipientInfo.name}
                </div>
              )}
              {fetching && (
                <div className="text-center">
                  <img alt="loading" src="/loading-ico1.gif" width="50px" />
                </div>
              )}
              {this.renderMessages()}
              {!fetching && !conversation.isSubscribed && (
                <div className="sub-text">
                  Please subscribe to this model to start the conversation
                </div>
              )}
            </div>

            {conversation.isSubscribed && (
              <Compose conversation={conversation} />
            )}
          </>
        ) : (
          <p className="text-center">Click conversation to start</p>
        )}
      </div>
    );
  }
}

const mapStates = (state: any) => {
  const { conversationMap } = state.message;
  const { activeConversation } = state.conversation;
  const messages = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].items || []
    : [];
  const totalMessages = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].total || 0
    : 0;
  const fetching = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].fetching || false
    : false;
  return {
    message: {
      items: messages,
      total: totalMessages,
      fetching
    },
    conversation: activeConversation,
    currentUser: state.user.current
  };
};

const mapDispatch = { loadMoreMessages };
export default connect(mapStates, mapDispatch)(MessageList);
