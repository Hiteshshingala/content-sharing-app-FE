import React, { PureComponent } from 'react';
import { Layout } from 'antd';

import { connect } from 'react-redux';
import Head from 'next/head';
import { HomePerformers } from '@components/performer';
import { Banner } from '@components/common';
import { getBanners } from '@redux/banner/actions';
import { performerService } from '@services/index';
import './index.less';
import { IPerformer, IUser } from 'src/interfaces';

interface IProps {
  ui: any;
  user: IUser | IPerformer;
  banners: any;
  getBanners: Function;
  performers: IPerformer[];
}

const { Content } = Layout;

class HomePage extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  static async getInitialProps() {
    try {
      const performers = await (
        await performerService.getTopPerformer({ limit: 40 })
      ).data.data;
      return {
        performers: performers || []
      };
    } catch (e) {
      return undefined;
    }
  }

  componentDidMount() {
    const { getBanners: getBannersHandler } = this.props;
    getBannersHandler({ status: 'active' });
  }

  render() {
    const { banners = [], ui, user, performers } = this.props;
    const topBanners =
      banners &&
      banners.data.length > 0 &&
      banners.data.filter((b) => b.position === 'top');
    // const leftBanners = banners && banners.data.length > 0 && banners.data.filter(b => b.position === 'left')
    // const rightBanners = banners && banners.data.length > 0 && banners.data.filter(b => b.position === 'right')
    const middleBanners =
      banners &&
      banners.data.length > 0 &&
      banners.data.filter((b) => b.position === 'middle');
    const bottomBanners =
      banners &&
      banners.data.length > 0 &&
      banners.data.filter((b) => b.position === 'bottom');
    return (
      <>
        <Head>
          <title>{ui && ui.siteName} | Home</title>
        </Head>
        <Layout>
          <Content>
            <div className="home-page">
              {topBanners && topBanners.length > 0 && (
                <div className="banner">
                  <Banner banners={topBanners} />
                </div>
              )}
              <div style={{ position: 'relative' }}>
                {/* <div className="banner-left">
                  {leftBanners && leftBanners.length > 0 && <Banner banners={leftBanners} />}
                </div>
                <div className="banner-right">
                  {rightBanners && rightBanners.length > 0 && <Banner banners={rightBanners} />}
                </div> */}
                <div className="main-container custom main-background">
                  {performers && performers.length > 0 ? (
                    <HomePerformers performers={performers} user={user} />
                  ) : (
                    <p className="text-center">No model found.</p>
                  )}
                </div>
                <div style={{ marginTop: '25px' }} />
              </div>
              {middleBanners && middleBanners.length > 0 && (
                <Banner banners={middleBanners} />
              )}
              {bottomBanners && bottomBanners.length > 0 && (
                <Banner banners={bottomBanners} />
              )}
            </div>
          </Content>
        </Layout>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui,
  banners: state.banner.listBanners.data,
  user: state.user.current
});

const mapDispatch = { getBanners };
export default connect(mapStates, mapDispatch)(HomePage);
