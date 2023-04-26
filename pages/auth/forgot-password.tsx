import React, { PureComponent } from 'react';
import { Form, Input, Button, Layout, Col, Row } from 'antd';

import Head from 'next/head';
import { IForgot } from 'src/interfaces';
import { forgot } from '@redux/auth/actions';
import { connect } from 'react-redux';
import Link from 'next/link';
import './index.less';

const { Content } = Layout;

interface IForgotFormProps {
  reset: Function;
}

const ForgotForm = ({ reset }: IForgotFormProps) => {
  const onFinish = (values: IForgot) => {
    reset(values);
  };

  return (
    <Form name="login-form" onFinish={onFinish}>
      <Form.Item
        hasFeedback
        name="email"
        validateTrigger={['onChange', 'onBlur']}
        rules={[
          {
            type: 'email',
            message: 'Invalid email format'
          },
          {
            required: true,
            message: 'Please enter your E-mail!'
          }
        ]}
      >
        <Input placeholder="Enter your email address" />
      </Form.Item>
      <Form.Item style={{ textAlign: 'center' }}>
        <Button
          className="primary"
          type="primary"
          htmlType="submit"
          style={{
            width: '100%',
            marginBottom: 15,
            fontWeight: 600,
            padding: '5px 25px',
            height: '42px'
          }}
        >
          Send
        </Button>
        <p>
          Have an account already?
          <Link href="/auth/login">
            <a> Login here.</a>
          </Link>
        </p>
        <p>
          Don&apos;t have an account yet
          <Link href="/auth/fan-register">
            <a> Register here.</a>
          </Link>
        </p>
      </Form.Item>
    </Form>
  );
};

interface IProps {
  auth: any;
  ui: any;
  forgot: Function;
  forgotData: any;
  query: any;
}

interface IState {
  type: string;
}

class Forgot extends PureComponent<IProps, IState> {
  static authenticate = false;

  constructor(props) {
    super(props);
    this.state = {
      type: 'user'
    };
  }

  static async getInitialProps({ ctx }) {
    const { query } = ctx;
    return { query };
  }

  componentDidMount() {
    const { query } = this.props;
    if (query && query.type) {
      this.setState({
        type: query.type
      });
    }
  }

  handleReset = (data: IForgot) => {
    const { type } = this.state;
    const { forgot: forgotHandler } = this.props;
    forgotHandler({
      ...data,
      type
    });
  };

  render() {
    const { ui } = this.props;
    const { siteName } = ui;
    return (
      <>
        <Head>
          <title>{siteName} | Forgot Password</title>
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
                    style={{ paddingTop: 70 }}
                  >
                    <h3
                      style={{
                        fontSize: 30,
                        textAlign: 'center',
                        fontFamily: 'Merriweather Sans Bold'
                      }}
                    >
                      Reset password
                    </h3>
                    <div>
                      <ForgotForm reset={this.handleReset} />
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

const mapStatetoProps = (state: any) => ({
  ui: { ...state.ui },
  forgotData: { ...state.auth.forgotData }
});

const mapDispatchToProps = { forgot };

export default connect(mapStatetoProps, mapDispatchToProps)(Forgot);
