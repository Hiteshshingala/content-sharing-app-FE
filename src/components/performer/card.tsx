import React, { PureComponent } from 'react';
import { IPerformer } from 'src/interfaces';
import Link from 'next/link';
import './performer.less';

interface IProps {
  performer: IPerformer;
}

export default class PerformerCard extends PureComponent<IProps> {
  render() {
    const { performer } = this.props;
    return (
      <div className="model-card">
        <Link
          href={{
            pathname: '/model/profile',
            query: { username: performer.username }
          }}
          as={`/model/${performer.username}`}
        >
          <a>
            <div className="card-img">
              <img alt="avatar" src={performer.avatar || '/no-avatar.png'} />
            </div>
            <div className="card-stat">
              <span>{performer?.stats?.views || 0} views</span>
              <span>{performer?.stats?.subscribers || 0} subs</span>
            </div>
            <div className="model-name">{performer.username}</div>
          </a>
        </Link>
        {/* <div className="hovering">
          <Link href={{ pathname: '/model/profile', query: { username: per.username } }} as={'/model/' + per.username}>
            <a>{per.username}</a>
          </Link>
        </div> */}
      </div>
    );
  }
}
