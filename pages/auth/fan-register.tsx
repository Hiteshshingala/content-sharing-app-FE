import React, { PureComponent } from 'react';
import { Row, Col, Button, Layout, Form, Input, Select } from 'antd';

import Link from 'next/link';
import { registerFan } from '@redux/auth/actions';
import { connect } from 'react-redux';
import Head from 'next/head';
import './index.less';
import { IUIConfig } from 'src/interfaces';

const { Option } = Select;

interface IMemberRegisterProps {
  onRegister: Function;
}

const MemberRegister = ({ onRegister }: IMemberRegisterProps) => {
  const onFinish = (values: any) => {
    onRegister(values);
  };

  return (
    <Form
      name="member_register"
      initialValues={{ remember: true, gender: 'male' }}
      onFinish={onFinish}
    >
      <Row>
        <Col xs={12} sm={12} md={12}>
          <Form.Item
            name="firstName"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Please input your first name!' },
              {
                pattern: new RegExp(
                  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                ),
                message:
                  'First name can not contain number and special character'
              }
            ]}
            hasFeedback
          >
            <Input placeholder="First name" />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12}>
          <Form.Item
            name="lastName"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Please input your last name!' },
              {
                pattern: new RegExp(
                  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                ),
                message:
                  'Last name can not contain number and special character'
              }
            ]}
            hasFeedback
          >
            <Input placeholder="Last name" />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12}>
          <Form.Item
            name="username"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Please input your username!' },
              {
                pattern: new RegExp(/^[A-Za-z0-9]+$/g),
                message: 'Username must contain Alphabets & Numbers only'
              },
              {
                min: 3,
                message: 'Username must containt at least 3 characters'
              }
            ]}
            hasFeedback
          >
            <Input placeholder="Username" />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12} lg={12}>
          <Form.Item
            name="gender"
            validateTrigger={['onChange', 'onBlur']}
            rules={[{ required: true }]}
            hasFeedback
          >
            <Select>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="transgender">Transgender</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24}>
          <Form.Item
            name="email"
            validateTrigger={['onChange', 'onBlur']}
            hasFeedback
            rules={[
              {
                type: 'email',
                message: 'Invalid email address!'
              },
              {
                required: true,
                message: 'Please input your email address!'
              }
            ]}
          >
            <Input placeholder="Email address" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item
            name="password"
            validateTrigger={['onChange', 'onBlur']}
            hasFeedback
            rules={[
              { required: true, message: 'Please input your password!' },
              {
                min: 6,
                message: 'Password must contain at least 6 characters.'
              }
            ]}
          >
            <Input type="password" placeholder="Password" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item
            name="confirm"
            validateTrigger={['onChange', 'onBlur']}
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm your password!'
              },
              {
                min: 6,
                message: 'Password must contain at least 6 characters.'
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return Promise.reject('Passwords do not match together!');
                }
              })
            ]}
          >
            <Input type="password" placeholder="Confirm password" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ textAlign: 'center' }}>
        <Button
          type="primary"
          htmlType="submit"
          style={{
            marginBottom: 15,
            fontWeight: 600,
            padding: '5px 25px',
            height: '42px'
          }}
        >
          Create your Account
        </Button>
        <p>
          Have an account already?
          <Link href="/auth/login">
            <a> Login here.</a>
          </Link>
        </p>
        <p>
          Are you a model?
          <Link href="/auth/model-register">
            <a> Register here.</a>
          </Link>
        </p>
      </Form.Item>
    </Form>
  );
};

const { Content } = Layout;

interface IProps {
  ui: IUIConfig;
  registerFan: Function;
}

class FanRegister extends PureComponent<IProps> {
  static authenticate: boolean = false;

  handleRegister = (data: any) => {
    const { registerFan: registerFanHandler } = this.props;
    registerFanHandler(data);
  };

  render() {
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>{ui && ui.siteName} | Fan Register</title>
        </Head>
        <Content>
          <div className="main-container">
            <div className="login-box register-box">
              <Row>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={8}
                  xl={8}
                  className="login-content left"
                />
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={16}
                  xl={16}
                  className="login-content right"
                >
                  <p className="text-center">
                    <span className="title">Fan Register</span>
                  </p>
                  <div className="register-form">
                    <MemberRegister onRegister={this.handleRegister} />
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }
}
const mapStatesToProps = (state: any) => ({
  ui: state.ui
});

const mapDispatchToProps = { registerFan };

export default connect(mapStatesToProps, mapDispatchToProps)(FanRegister);
