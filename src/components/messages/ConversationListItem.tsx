/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Badge } from 'antd';

import './ConversationListItem.less';

interface IProps {
  setActive: Function;
  selected: boolean;
  data: any;
}

export default function ConversationListItem({
  setActive,
  selected,
  data
}: IProps) {
  const { recipientInfo, lastMessage, _id, totalNotSeenMessages = 0 } = data;
  const className = selected
    ? 'conversation-list-item active'
    : 'conversation-list-item';

  return (
    <div className={className} onClick={() => setActive(_id)}>
      <div className="conversation-left-corner">
        <img
          className="conversation-photo"
          src={
            recipientInfo && recipientInfo.avatar
              ? recipientInfo.avatar
              : '/no-avatar.png'
          }
          alt="conversation"
        />
        {/* <span>@{recipientInfo && recipientInfo.username}</span> */}
        <span className={recipientInfo.isOnline ? 'online' : 'offline'} />
      </div>
      <div className="conversation-info">
        <h1 className="conversation-title">
          {recipientInfo && recipientInfo.name}
        </h1>
        <p className="conversation-snippet">{lastMessage}</p>
        {/* <p className="conversation-time">{moment(lastMessageCreatedAt ? lastMessageCreatedAt : updatedAt).fromNow()}</p> */}
      </div>
      <Badge className="notification-badge" count={totalNotSeenMessages} />
    </div>
  );
}
