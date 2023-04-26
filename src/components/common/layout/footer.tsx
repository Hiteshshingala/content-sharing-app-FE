import React, { PureComponent } from 'react';
import Link from 'next/link';
import { connect } from 'react-redux';
import { IUser, IUIConfig } from 'src/interfaces';

interface IProps {
  currentUser: IUser;
  ui: IUIConfig;
}
class Footer extends PureComponent<IProps, any> {
  render() {
    const linkAuth = (
      <>
        <li>
          <Link href="/">
            <a>Signup</a>
          </Link>
        </li>
        <li>
          <Link href="/auth/login">
            <a>Login</a>
          </Link>
        </li>
      </>
    );
    const { ui, currentUser } = this.props;
    const menus =
      ui.menus && ui.menus.length > 0
        ? ui.menus.filter((m) => m.section === 'footer')
        : [];
    return (
      <div className="main-footer">
        <div className="main-container">
          <ul>
            <li />
            {menus &&
              menus.length > 0 &&
              menus.map((item) => (
                <li key={item._id}>
                  {!item.internal ? (
                    <a href={item.path}>{item.title}</a>
                  ) : (
                    <Link
                      href={{
                        pathname: '/page',
                        query: { id: item.path.replace('/page/', '') }
                      }}
                      as={item.path}
                    >
                      <a>{item.title}</a>
                    </Link>
                  )}
                </li>
              ))}
            {!currentUser._id ? linkAuth : null}
          </ul>
          <div className="copyright-text">
            <span>
              <Link href="/">
                <a>{ui && ui.siteName}</a>
              </Link>
              © Copyright {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    );
  }
}
const mapState = (state: any) => ({
  currentUser: state.user.current,
  ui: state.ui
});
export default connect(mapState)(Footer) as any;
