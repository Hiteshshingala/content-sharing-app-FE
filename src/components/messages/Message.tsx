import React from 'react';
import moment from 'moment';
import './Message.less';

interface IMessageProps {
  data: any;
  isMine: boolean;
  startsSequence: any;
  endsSequence: any;
  showTimestamp: boolean;
  currentUser: any;
  recipient: any;
}

export default function Message({
  data,
  isMine,
  startsSequence,
  endsSequence,
  showTimestamp,
  currentUser,
  recipient
}: IMessageProps) {
  const friendlyTimestamp = moment(data.timestamp).format('LLLL');
  return (
    <div
      className={[
        'message',
        `${isMine ? 'mine' : ''}`,
        `${startsSequence ? 'start' : ''}`,
        `${endsSequence ? 'end' : ''}`
      ].join(' ')}
    >
      {data.text && (
        <div className="bubble-container">
          {!isMine && (
            <img
              alt="avatar"
              className="avatar"
              src={recipient.avatar || '/no-avatar.png'}
            />
          )}
          <div className="bubble" title={friendlyTimestamp}>
            {!data.imageUrl && data.text}{' '}
            {data.imageUrl && (
              <a
                title="Click to view full content"
                href={data.imageUrl}
                rel="noreferrer"
                target="_blank"
              >
                <img alt="img" src={data.imageUrl} width="180px" />
              </a>
            )}
          </div>
          {isMine && (
            <img
              alt="avatar"
              src={currentUser.avatar || '/no-avatar.png'}
              className="avatar"
            />
          )}
        </div>
      )}
      {showTimestamp && <div className="timestamp">{friendlyTimestamp}</div>}
    </div>
  );
}
