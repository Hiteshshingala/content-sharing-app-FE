import React, { PureComponent } from 'react';
import { Layout } from 'antd';
import { connect } from 'react-redux';
import Head from 'next/head';
import { IUIConfig } from 'src/interfaces/';
import Messenger from '@components/messages/Messenger';

interface IProps {
  getList: Function;
  performerState: any;
  ui: IUIConfig;
  query: Record<string, string>;
}

const { Content } = Layout;
class Messages extends PureComponent<IProps> {
  static authenticate = true;

  static getInitialProps({ ctx }) {
    return {
      query: ctx.query
    };
  }

  render() {
    const { ui, query = {} } = this.props;
    return (
      <>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Messages
          </title>
        </Head>
        <Layout>
          <Content>
            <div className="main-container" style={{ marginBottom: '70px' }}>
              <Messenger toSource={query.toSource} toId={query.toId} />
            </div>
          </Content>
        </Layout>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui
});

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(Messages);
