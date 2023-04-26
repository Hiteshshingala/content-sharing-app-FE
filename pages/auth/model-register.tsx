import React, { PureComponent } from 'react';
import { Row, Col, Button, Layout, Form, Input, Select, message } from 'antd';

import Link from 'next/link';
import Head from 'next/head';
import './index.less';
import { connect } from 'react-redux';
import { registerPerformer } from '@redux/auth/actions';
import { ICountry, IUIConfig } from 'src/interfaces';
import { utilsService } from 'src/services';
import { ImageUpload } from '@components/file/image-upload';

const { Content } = Layout;
const { Option } = Select;

interface IModelRegisterProps {
  onsubmit: Function;
  onFileReaded: Function;
  onRequesting: boolean;
  countries: any[];
}

const ModelRegister = ({
  onsubmit,
  onFileReaded,
  onRequesting,
  countries
}: IModelRegisterProps) => {
  const onFinish = (values: any) => {
    onsubmit(values);
  };
  return (
    <Form
      name="member_register"
      initialValues={{ remember: true, gender: 'male', country: 'US' }}
      onFinish={onFinish}
    >
      <Row>
        <Col xs={24} sm={12} md={12}>
          <Form.Item
            name="firstName"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Please input your name!' },
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
        <Col xs={24} sm={12} md={12}>
          <Form.Item
            name="lastName"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Please input your name!' },
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
        <Col xs={24} sm={12} md={12}>
          <Form.Item
            name="username"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Please input your username!' },
              {
                pattern: new RegExp(/^[a-z0-9]+$/g),
                message: 'Username must contain only Alphabets & Numbers'
              },
              {
                min: 3,
                message: 'username must containt at least 3 characters'
              }
            ]}
            hasFeedback
          >
            <Input placeholder="Username" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Form.Item
            name="email"
            validateTrigger={['onChange', 'onBlur']}
            hasFeedback
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!'
              },
              {
                min: 6,
                message: 'Password must contain at least 6 characters.'
              },
              {
                required: true,
                message: 'Please input your E-mail!'
              }
            ]}
          >
            <Input placeholder="Email address" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12}>
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
        <Col xs={24} sm={12} md={12}>
          <Form.Item name="country" rules={[{ required: true }]} hasFeedback>
            <Select
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {countries &&
                countries.length > 0 &&
                countries.map((c) => (
                  <Option value={c.code} key={c.code}>
                    {c.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Form.Item
            name="password"
            hasFeedback
            rules={[
              { required: true, message: 'Please input your Password!' },
              {
                min: 6,
                message: 'Password must contain at least 6 characters.'
              }
            ]}
          >
            <Input type="password" placeholder="Confirm password" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              {
                required: true,
                message: 'Please confirm your password!'
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
        <Col xs={24} sm={24} md={24}>
          <Form.Item
            labelCol={{ span: 24 }}
            name="upload"
            label="Photo ID verification"
            valuePropName="fileList"
            className="model-photo-verification"
          >
            <ImageUpload onFileReaded={onFileReaded} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ textAlign: 'center' }}>
        <Button
          type="primary"
          htmlType="submit"
          disabled={onRequesting}
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
          Are you a fan?
          <Link href="/auth/fan-register">
            <a> Register here.</a>
          </Link>
        </p>
      </Form.Item>
    </Form>
  );
};

interface IProps {
  registerPerformerData: any;
  registerPerformer: Function;
  ui: IUIConfig;
}

class RegisterPerformer extends PureComponent<IProps> {
  static authenticate = false;

  state = {
    verificationFile: null,
    countries: [] as ICountry[]
  };

  componentDidMount() {
    this.getCountries();
  }

  onFileReaded(file: File) {
    if (file) {
      this.setState({
        verificationFile: file
      });
    }
  }

  async getCountries() {
    const resp = await utilsService.countriesList();
    await this.setState({ countries: resp.data });
  }

  register = (values: any) => {
    const { verificationFile } = this.state;
    const { registerPerformer: registerPerformerHandler } = this.props;
    if (!verificationFile) {
      return message.error('ID photo is required', 5);
    }
    // eslint-disable-next-line no-param-reassign
    values.verificationFile = verificationFile;
    return registerPerformerHandler(values);
  };

  render() {
    const { registerPerformerData = { requesting: false }, ui } = this.props;
    const { countries } = this.state;
    return (
      <Layout>
        <Head>
          <title>{ui && ui.siteName} | Model Register</title>
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
                    <span className="title">Model Register</span>
                  </p>
                  <div className="register-form">
                    <ModelRegister
                      onsubmit={this.register}
                      onFileReaded={this.onFileReaded.bind(this)}
                      onRequesting={registerPerformerData.requesting}
                      countries={countries}
                    />
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
  ui: { ...state.ui },
  registerPerformerData: { ...state.auth.registerPerformerData }
});

const mapDispatchToProps = { registerPerformer };

export default connect(mapStatesToProps, mapDispatchToProps)(RegisterPerformer);
