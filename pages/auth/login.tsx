/* eslint-disable react/jsx-no-bind */
import React, { PureComponent } from 'react';
import { Form, Checkbox, Input, Button, Row, Col, Layout, Switch } from 'antd';

import { connect } from 'react-redux';
import Head from 'next/head';
import { login, loginPerformer, loginSuccess } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { authService, performerService, userService } from '@services/index';
import Link from 'next/link';
import './index.less';
import { IUIConfig } from 'src/interfaces';
import Router from 'next/router';

const { Content } = Layout;

interface ILoginFormProps {
  onlogin: Function;
  isPerformer: boolean;
  loginUsername: boolean;
  onSwitchType: Function;
}

const LoginForm = ({
  onlogin,
  isPerformer,
  loginUsername,
  onSwitchType
}: ILoginFormProps) => {
  const onFinish = (values: any) => {
    onlogin(values, isPerformer, loginUsername);
  };

  const onSwitch = (value: boolean) => {
    onSwitchType(value, isPerformer);
  };

  return (
    <Form
      name={`normal_login${isPerformer ? '1' : '0'}`}
      className="login-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
    >
      <div className="switch-grp">
        <Switch
          checkedChildren="Username"
          unCheckedChildren="E-mail"
          checked={loginUsername}
          onChange={onSwitch}
        />
      </div>
      {!loginUsername && (
        <Form.Item
          name="email"
          hasFeedback
          validateTrigger={['onChange', 'onBlur']}
          rules={[
            { required: true, message: 'Please enter your email address!' },
            { type: 'email', message: 'Invalid email address' }
          ]}
        >
          <Input placeholder="Email address" />
        </Form.Item>
      )}
      {loginUsername && (
        <Form.Item
          name="username"
          hasFeedback
          validateTrigger={['onChange', 'onBlur']}
          rules={[{ required: true, message: 'Please enter your username!' }]}
        >
          <Input placeholder="Username" />
        </Form.Item>
      )}
      <Form.Item
        name="password"
        hasFeedback
        validateTrigger={['onChange', 'onBlur']}
        rules={[
          { required: true, message: 'Please enter your password!' },
          { min: 6, message: 'Password is at least 6 characters' }
        ]}
      >
        <Input type="password" placeholder="Password" />
      </Form.Item>
      <Form.Item>
        <Row>
          <Col span={12}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Link
              href={{
                pathname: '/auth/forgot-password',
                query: { type: isPerformer ? 'performer' : 'user' }
              }}
            >
              <a className="login-form-forgot">Forgot password?</a>
            </Link>
          </Col>
        </Row>
      </Form.Item>
      <Form.Item style={{ textAlign: 'center' }}>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Login
        </Button>
        <p>
          Don&apos;t have an account yet?
          <Link
            href={isPerformer ? '/auth/model-register' : '/auth/fan-register'}
          >
            <a> Create an account</a>
          </Link>
        </p>
      </Form.Item>
    </Form>
  );
};

interface IProps {
  loginAuth: any;
  login: Function;
  loginPerformer: Function;
  updateCurrentUser: Function;
  loginSuccess: Function;
  ui: IUIConfig;
}

interface ILoginState {
  performerLoginUsername: boolean;
  userLoginUsername: boolean;
  loginAs: string;
}

class Login extends PureComponent<IProps, ILoginState> {
  static authenticate: boolean = false;

  constructor(props) {
    super(props);
    this.state = {
      performerLoginUsername: false,
      userLoginUsername: false,
      loginAs: 'user'
    };
  }

  async componentDidMount() {
    const token = authService.getToken();
    const role = authService.getUserRole();
    const rememberMe = process.browser && localStorage.getItem('rememberMe');
    if (!token || token == null || !rememberMe) {
      return;
    }
    console.log(token, rememberMe);
    authService.setAuthHeaderToken(token);
    let user = null;
    try {
      const {
        loginSuccess: loginSuccessHandler,
        updateCurrentUser: updateCurrentUserHandler
      } = this.props;

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

  onSwitchType(val: boolean, isPerformer: boolean) {
    if (isPerformer) {
      this.setState({
        performerLoginUsername: val
      });
    }
    if (!isPerformer) {
      this.setState({
        userLoginUsername: val
      });
    }
  }

  handleLogin = (values: any, isPerformer: boolean, loginUsername: boolean) => {
    // eslint-disable-next-line no-param-reassign
    values.loginUsername = loginUsername;

    const {
      loginPerformer: loginPerformerHandler,
      login: loginHandler
    } = this.props;

    localStorage.setItem('rememberMe', values.remember ? 'true' : 'false');
    return isPerformer ? loginPerformerHandler(values) : loginHandler(values);
  };

  handleSwitch(value) {
    this.setState({ loginAs: value });
  }

  render() {
    const { ui } = this.props;
    const { siteName } = ui;
    const { loginAs, userLoginUsername, performerLoginUsername } = this.state;
    return (
      <>
        <Head>
          <title>{siteName} | Login</title>
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
                        Fan Login
                      </button>
                      <button
                        type="button"
                        className={loginAs === 'performer' ? 'active' : ''}
                        onClick={this.handleSwitch.bind(this, 'performer')}
                      >
                        Model Login
                      </button>
                    </div>
                    <div className="title">
                      <h3>
                        {loginAs === 'user' ? 'Fans Login' : 'Model Login'}
                      </h3>
                    </div>
                    <div className="login-form">
                      {loginAs === 'user' ? (
                        <LoginForm
                          onlogin={this.handleLogin}
                          isPerformer={false}
                          loginUsername={userLoginUsername}
                          onSwitchType={this.onSwitchType.bind(this)}
                        />
                      ) : (
                        <LoginForm
                          onlogin={this.handleLogin}
                          isPerformer
                          loginUsername={performerLoginUsername}
                          onSwitchType={this.onSwitchType.bind(this)}
                        />
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Content>
        </Layout>
      </>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui }
});

const mapDispatchToProps = {
  login,
  loginPerformer,
  loginSuccess,
  updateCurrentUser
};
export default connect(mapStatesToProps, mapDispatchToProps)(Login);
