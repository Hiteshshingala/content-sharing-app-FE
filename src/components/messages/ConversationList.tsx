import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import './ConversationList.less';
import {
  getConversations,
  setActiveConversation,
  getConversationDetail,
  receiveMessageSuccess
} from '@redux/message/actions';
import { Event } from 'src/socket';
import { debounce } from 'lodash';
import { IUser, IPerformer } from 'src/interfaces';
import ConversationSearch from './ConversationSearch';
import ConversationListItem from './ConversationListItem';

interface IProps {
  getConversations: Function;
  setActiveConversation: Function;
  getConversationDetail: Function;
  receiveMessageSuccess: Function;
  conversation: {
    list: {
      requesting: boolean;
      error: any;
      data: any[];
      total: number;
      success: boolean;
    };
    mapping: Record<string, any>;
    activeConversation: Record<string, any>;
  };
  toSource: string;
  toId: string;
  message: {
    conversationMap: {};
    sendMessage: {};
  };
  user: IUser | IPerformer;
}
class ConversationList extends PureComponent<IProps> {
  constructor(props) {
    super(props);
  }

  // state = {
  //   conversationPage: 1
  // }

  componentDidMount() {
    const {
      getConversations: getConversationsHandler,
      setActiveConversation: setActiveConversationHandler,
      toSource,
      toId,
      user
    } = this.props;
    // const { data: conversations } = conversation.list;
    getConversationsHandler();
    if (toSource && toId) {
      setActiveConversationHandler({
        source: toSource,
        sourceId: toId,
        recipientId: user._id
      });
    }
  }

  onMessage = (message) => {
    if (!message) {
      return;
    }
    const {
      conversation,
      getConversationDetail: getConversationDetailHandler,
      receiveMessageSuccess: receiveMessageSuccessHandler
    } = this.props;
    const { mapping } = conversation;
    if (!mapping[message.conversationId]) {
      getConversationDetailHandler({
        id: message.conversationId
      });
    }
    receiveMessageSuccessHandler(message);
  };

  // handleScroll = async (event) => {
  //   const { requesting, data, total } = this.props.conversation.list;
  //   const canloadmore = total > data.length;
  //   let ele = event.target;
  //   if (!canloadmore) return;
  //   if (ele.scrollHeight - ele.scrollTop === ele.clientHeight && !requesting && canloadmore) {
  //     await this.setState({ conversationPage: this.state.conversationPage + 1 });
  //     this.props.getConversations({ limit: 50, offset: (this.state.conversationPage - 1) * 50 })
  //   }
  // }

  onSearchConversation = debounce((e) => {
    const { value } = e.target;
    const { getConversations: getConversationsHandler } = this.props;
    if (value) {
      return getConversationsHandler({ keyword: value });
    }
    return getConversationsHandler();
  }, 300);

  setActive = (conversationId) => {
    const {
      setActiveConversation: setActiveConversationHandler,
      user
    } = this.props;
    setActiveConversationHandler({ conversationId, recipientId: user._id });
  };

  render() {
    const { conversation, user } = this.props;
    const { data: conversations, requesting } = conversation.list;
    const { mapping, activeConversation = {} } = conversation;
    return (
      <div className="conversation-list">
        <Event event="message_created" handler={this.onMessage} />
        <div className="user-bl">
          <img alt="avatar" src={user.avatar || '/no-avatar.png'} /> {user.name}
        </div>
        <ConversationSearch
          onSearch={(e) => {
            e.persist();
            this.onSearchConversation(e);
          }}
        />
        {conversations.length > 0 &&
          conversations.map((conversationId) => (
            <ConversationListItem
              key={conversationId}
              data={mapping[conversationId]}
              setActive={this.setActive}
              selected={activeConversation._id === conversationId}
            />
          ))}
        {requesting && <p className="text-center">searching...</p>}
        {!requesting && !conversations.length && (
          <p className="text-center">No conversation found.</p>
        )}
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  conversation: state.conversation,
  message: state.message,
  user: state.user.current
});

const mapDispatch = {
  getConversations,
  setActiveConversation,
  getConversationDetail,
  receiveMessageSuccess
};
export default connect(mapStates, mapDispatch)(ConversationList);
