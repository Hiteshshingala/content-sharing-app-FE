import React, { PureComponent } from 'react';
import { Row, Col, Layout } from 'antd';
import Link from 'next/link';
import Head from 'next/head';
import { IUIConfig } from 'src/interfaces';
import { connect } from 'react-redux';
import { authService, performerService, userService } from '@services/index';
import { loginSuccess } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import Router from 'next/router';
import './auth/index.less';

const { Content } = Layout;
interface IProps {
  ui: IUIConfig;
  loginSuccess: Function;
  updateCurrentUser: Function;
}
class Dashboard extends PureComponent<IProps> {
  static authenticate = false;

  state = {
    loginAs: 'user'
  };

  async componentDidMount() {
    const {
      loginSuccess: loginSuccessHandler,
      updateCurrentUser: updateCurrentUserHandler
    } = this.props;
    const token = authService.getToken();
    const role = authService.getUserRole();
    const rememberMe = process.browser && localStorage.getItem('rememberMe');
    if (!token || token == null || !rememberMe) {
      return;
    }
    authService.setAuthHeaderToken(token);
    let user = null;
    try {
      if (role === 'performer') {
        user = await performerService.me({
          Authorization: token
        });
      } else {
        user = await userService.me({
          Authorization: token
        });
      }
      // TODO - check permission
      loginSuccessHandler();
      updateCurrentUserHandler(user.data);
      Router.push('/home');
    } catch (e) {
      // console.log(e);
    }
  }

  handleSwitch(value) {
    this.setState({ loginAs: value });
  }

  render() {
    const { ui } = this.props;
    const { loginAs } = this.state;
    return (
      <div className="container">
        <Head>
          <title>{ui && ui.siteName} | Welcome</title>
        </Head>
        <Layout>
          <Content>
            <div className="main-container">
              <div className="login-box">
                <Row>
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    xl={12}
                    className="login-content left"
                  />
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    xl={12}
                    className="login-content right"
                  >
                    <div className="switch-btn">
                      <button
                        type="button"
                        className={loginAs === 'user' ? 'active' : ''}
                        onClick={this.handleSwitch.bind(this, 'user')}
                        style={{ marginRight: '20px' }}
                      >
                        Fans Signup
                      </button>
                      <button
                        type="button"
                        className={loginAs === 'performer' ? 'active' : ''}
                        onClick={this.handleSwitch.bind(this, 'performer')}
                      >
                        Model Signup
                      </button>
                    </div>

                    <div className="welcome-box">
                      <h3>{loginAs === 'user' ? 'Fan' : 'Model'} Benefits</h3>
                      {loginAs === 'performer' ? (
                        <div>
                          <ul>
                            <li>Lightning fast uploading</li>
                            <li>Multi-video uploading</li>
                            <li>Model-to-Model communication</li>
                            <li>Chat with fans</li>
                            <li>Cross-over-content between models</li>
                            <li>Individual model store</li>
                            <li>
                              Affiliate program for blogs to promote your
                              content
                            </li>
                            <li>80% Standard commission rate</li>
                            <li>(Deduct 5% when gained from affiliates)</li>
                          </ul>
                          <Link href="/auth/model-register">
                            <a className="btn-primary ant-btn ant-btn-primary ant-btn-lg">
                              Model Signup
                            </a>
                          </Link>
                        </div>
                      ) : (
                        <div>
                          <ul>
                            <li>View exclusive content</li>
                            <li>Monthly and Yearly subscriptions</li>
                            <li>Fast and reliable buffering and viewing</li>
                            <li>Multiple solution options to choose from</li>
                            <li>Chat with model</li>
                            <li>Access model&apos;s personal store</li>
                            <li>Search and filter capabilities</li>
                            <li>Favorite your video for future viewing</li>
                          </ul>
                          <Link href="/auth/fan-register">
                            <a className="btn-primary ant-btn ant-btn-primary ant-btn-lg">
                              Fan Signup
                            </a>
                          </Link>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Content>
        </Layout>
      </div>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui }
});

const mapDispatch = { loginSuccess, updateCurrentUser };

export default connect(mapStatesToProps, mapDispatch)(Dashboard);
