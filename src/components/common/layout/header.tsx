import React, { PureComponent, Fragment } from 'react';
import { Layout, Menu, Avatar, Badge } from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link';
import { IUser } from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import { ShoppingCartOutlined, MessageOutlined } from '@ant-design/icons';
import './header.less';
import { withRouter } from 'next/router';
import { addCart } from 'src/redux/cart/actions';
import { cartService, messageService, authService } from 'src/services';
import { Event, SocketContext } from 'src/socket';
import SearchBar from './search-bar';

interface IProps {
  currentUser?: IUser;
  logout?: Function;
  router: any;
  ui?: any;
  cart?: any;
  addCart: Function;
}

class Header extends PureComponent<IProps> {
  state = {
    totalNotReadMessage: 0
  };

  async componentDidMount() {
    if (process.browser) {
      const { cart, currentUser, addCart: addCartHandler } = this.props;
      if (!cart || (cart && cart.items.length <= 0)) {
        if (currentUser._id) {
          const existCart = await cartService.getCartByUser(currentUser._id);
          if (existCart && existCart.length > 0) {
            addCartHandler(existCart);
          }
        }
      }
    }
  }

  async componentDidUpdate(prevProps: any) {
    const { cart, currentUser, addCart: addCartHandler } = this.props;
    if (prevProps.currentUser !== currentUser) {
      if (!cart || (cart && cart.items.length <= 0)) {
        if (currentUser._id && process.browser) {
          const existCart = await cartService.getCartByUser(currentUser._id);
          if (existCart && existCart.length > 0) {
            addCartHandler(existCart);
          }
        }
      }
      if (currentUser && currentUser._id) {
        const data = await (await messageService.countTotalNotRead()).data;
        if (data) {
          // eslint-disable-next-line react/no-did-update-set-state
          this.setState({ totalNotReadMessage: data.total });
        }
      }
    }
  }

  handleMessage = async (event) => {
    event && this.setState({ totalNotReadMessage: event.total });
  };

  async beforeLogout() {
    const { logout: logoutHandler } = this.props;
    const token = authService.getToken();
    const socket = this.context;
    token &&
      socket &&
      (await socket.emit('auth/logout', {
        token
      }));
    socket && socket.close();
    logoutHandler();
  }

  render() {
    const { currentUser, router, ui, cart } = this.props;
    const { totalNotReadMessage } = this.state;
    const rightContent = [
      <Menu key="user" mode="horizontal">
        <Menu.SubMenu
          title={
            <>
              <span className="username">{currentUser.name}</span>
              <Avatar src={currentUser.avatar || '/no-avatar.png'} />
            </>
          }
        >
          <Menu.Item key="settings">
            {!currentUser.isPerformer && (
              <Link href="/user/account">
                <a>My Account</a>
              </Link>
            )}
            {currentUser.isPerformer && (
              <Link href="/model/account">
                <a>My Account</a>
              </Link>
            )}
          </Menu.Item>
          {currentUser.isPerformer && (
            <Menu.Item key="video-manager">
              <Link href="/video-manager">
                <a>My Videos</a>
              </Link>
            </Menu.Item>
          )}
          {currentUser.isPerformer && (
            <Menu.Item key="store-manager">
              <Link href="/store-manager">
                <a>My Store</a>
              </Link>
            </Menu.Item>
          )}
          {currentUser.isPerformer && (
            <Menu.Item>
              <Link href="/gallery-manager/listing">
                <a>My Galleries</a>
              </Link>
            </Menu.Item>
          )}
          {currentUser.isPerformer && (
            <Menu.Item key="my-subscriber">
              <Link href={{ pathname: '/my-subscriber' }} as="/my-subscriber">
                <a>My Subscribers</a>
              </Link>
            </Menu.Item>
          )}
          {currentUser.isPerformer && (
            <Menu.Item key="my-order">
              <Link href={{ pathname: '/order-manager' }} as="/order-manager">
                <a>Orders</a>
              </Link>
            </Menu.Item>
          )}
          {!currentUser.isPerformer && (
            <Menu.Item key="favourite-video">
              <Link href="/my-favourite">
                <a>My Favourite</a>
              </Link>
            </Menu.Item>
          )}
          {!currentUser.isPerformer && (
            <Menu.Item key="watch-late-video">
              <Link href="/my-wishlist">
                <a>My Wishlist</a>
              </Link>
            </Menu.Item>
          )}
          {!currentUser.isPerformer && (
            <Menu.Item key="my-subscription">
              <Link href="/my-subscription">
                <a>My Subscription</a>
              </Link>
            </Menu.Item>
          )}
          {!currentUser.isPerformer && (
            <Menu.Item key="payment-history">
              <Link href="/user/payment-history">
                <a>Payment History</a>
              </Link>
            </Menu.Item>
          )}
          {currentUser.isPerformer && (
            <Menu.Item key="earning">
              <Link href="/earning">
                <a>Earnings</a>
              </Link>
            </Menu.Item>
          )}
          {currentUser.isPerformer && (
            <Menu.Item key="payment-history">
              <Link href={{ pathname: '/model/top-models' }} as="/top-models">
                <a>Top Models</a>
              </Link>
            </Menu.Item>
          )}
          <Menu.Item key="SignOut" onClick={() => this.beforeLogout()}>
            <a>Sign Out</a>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    ];

    return (
      <div className="bg-black">
        <Event
          event="nofify_read_messages_in_conversation"
          handler={this.handleMessage}
        />
        <div className="main-container">
          <Layout.Header className="header" id="layoutHeader">
            <div className="nav-bar">
              <div className="left-conner">
                <Link href="/home">
                  <a className="logo-nav">
                    <img
                      alt="logo"
                      src={ui && ui.logo ? ui.logo : '/logo.png'}
                      height="64"
                    />
                  </a>
                </Link>
                <SearchBar />
              </div>
              <div className="mid-conner">
                <ul className="nav-icons">
                  {currentUser &&
                    currentUser.isPerformer &&
                    router.asPath !== `/model/${currentUser.username}` && (
                      <li
                        className={
                          router.asPath === `/model/${currentUser.username}`
                            ? 'active'
                            : ''
                        }
                      >
                        <Link
                          href={{
                            pathname: '/model/profile',
                            query: { username: currentUser.username }
                          }}
                          as={`/model/${currentUser.username}`}
                        >
                          <a>My Profile</a>
                        </Link>
                      </li>
                    )}
                  {!currentUser ||
                    (!currentUser.isPerformer && (
                      <li
                        className={router.pathname === '/home' ? 'active' : ''}
                      >
                        <Link href="/home">
                          <a>Home</a>
                        </Link>
                      </li>
                    ))}
                  <li className={router.pathname === '/model' ? 'active' : ''}>
                    <Link href={{ pathname: '/model' }} as="/model">
                      <a>Models</a>
                    </Link>
                  </li>
                  <li
                    className={router.pathname === '/contact' ? 'active' : ''}
                  >
                    <Link href="/contact">
                      <a>Contact</a>
                    </Link>
                  </li>
                  {currentUser && currentUser._id && !currentUser.isPerformer && (
                    <li className={router.pathname === '/cart' ? 'active' : ''}>
                      <Link href="/cart">
                        <a>
                          <ShoppingCartOutlined />
                          <Badge
                            className="cart-total"
                            count={cart.total}
                            showZero
                          />
                        </a>
                      </Link>
                    </li>
                  )}
                  {currentUser && currentUser._id && (
                    <li
                      className={
                        router.pathname === '/messages' ? 'active' : ''
                      }
                    >
                      <Link href="/messages">
                        <a>
                          <MessageOutlined />
                          <Badge
                            className="cart-total"
                            count={totalNotReadMessage}
                            showZero
                          />
                        </a>
                      </Link>
                    </li>
                  )}
                  {!currentUser._id && (
                    <li
                      className={
                        router.pathname === '/auth/login' ? 'active' : ''
                      }
                    >
                      <Link href="/auth/login">
                        <a>Login</a>
                      </Link>
                    </li>
                  )}
                  {!currentUser._id && (
                    <li className={router.pathname === '/' ? 'active' : ''}>
                      <Link href="/">
                        <a>Sign Up</a>
                      </Link>
                    </li>
                  )}
                  {currentUser && currentUser._id && (
                    <li className="no-pad">{rightContent}</li>
                  )}
                </ul>
              </div>
              {/* <div className="rightContainer">
                {currentUser && currentUser._id && rightContent}
              </div> */}
            </div>
          </Layout.Header>
        </div>
      </div>
    );
  }
}

Header.contextType = SocketContext;
const mapState = (state: any) => ({
  currentUser: state.user.current,
  ui: state.ui,
  cart: state.cart
});
const mapDispatch = { logout, addCart };
export default withRouter(connect(mapState, mapDispatch)(Header)) as any;
