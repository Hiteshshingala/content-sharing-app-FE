import React, { PureComponent } from 'react';
import { Layout, Collapse, Tabs, Button, Row, Col, message, Modal } from 'antd';

import { connect } from 'react-redux';
import { getVideos, moreVideo, getVods } from '@redux/video/actions';
import { getGalleries } from '@redux/gallery/actions';
import { listProducts, moreProduct } from '@redux/product/actions';
import { performerService, photoService, paymentService } from 'src/services';
import Head from 'next/head';
import '@components/performer/performer.less';
import { CheckCircleOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { PerformerListVideo } from '@components/video/performer-list';
import { PerformerListProduct } from '@components/product/performer-list-product';
import PerformerInfo from '@components/performer/table-info';
import GalleryCard from '@components/gallery/gallery-card';
import PhotosSlider from '@components/photo/photo-slider';
import Link from 'next/link';
import { redirectToErrorPage } from '@redux/system/actions';
import {
  IPerformer,
  IGallery,
  IUser,
  IUIConfig
} from '../../../src/interfaces';

interface IProps {
  ui: IUIConfig;
  currentUser: IUser | IPerformer;
  performer: IPerformer;
  query: any;
  listProducts: Function;
  getVideos: Function;
  moreVideo: Function;
  getVods: Function;
  moreProduct: Function;
  videos: any;
  saleVideos: any;
  products: any;
  getGalleries: Function;
  galleries: any;
  error: any;
  redirectToErrorPage: Function;
}

const { Content } = Layout;
const { Panel } = Collapse;
const { TabPane } = Tabs;

class PerformerProfile extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  state = {
    itemPerPage: 24,
    videoPage: 1,
    // eslint-disable-next-line react/no-unused-state
    photoPage: 1,
    canVidLoadMore: true,
    vodPage: 1,
    canVodLoadMore: true,
    productPage: 1,
    canProductLoadMore: true,
    sellectedGallery: null,
    galleryPhotos: null,
    visibleModal: false,
    isSubscribed: false,
    viewedVideo: true
  };

  static async getInitialProps({ ctx }) {
    const { query } = ctx;
    try {
      const performer = (await (
        await performerService.findOne(query.username, {
          Authorization: ctx.token || ''
        })
      ).data) as IPerformer;
      return {
        performer
      };
    } catch (e) {
      const error = await Promise.resolve(e);
      return { error };
    }
  }

  async componentDidMount() {
    const {
      performer,
      currentUser,
      error,
      redirectToErrorPage: redirectToErrorPageHandler,
      getGalleries: getGalleriesHandler,
      listProducts: listProductsHandler,
      getVideos: getVideosHandler,
      getVods: getVodsHandler
    } = this.props;
    const { itemPerPage, productPage, videoPage } = this.state;
    if (error && process.browser) {
      redirectToErrorPageHandler({
        url: '/error',
        error: {
          ...error,
          message:
            // eslint-disable-next-line no-nested-ternary
            error.message === 'BLOCKED_BY_PERFORMER'
              ? 'You have been blocked by this performer, please contact us for any questions'
              : error.message === 'BLOCK_COUNTRY'
              ? 'You cannot view the profile of this model. This model has blocked access from your country'
              : error.message
        }
      });
    }

    if (!performer) {
      // move to 404?
      return;
    }
    if (currentUser && currentUser._id) {
      if (currentUser._id === performer._id) {
        this.setState({ isSubscribed: true });
      } else {
        const sub = await (await performerService.checkSubscribe(performer._id))
          .data;
        if (sub.subscribed) {
          this.setState({ isSubscribed: true });
        }
      }
    }
    performerService.increaseView(performer.username);
    getGalleriesHandler({
      limit: 200,
      performerId: performer._id
    });
    listProductsHandler({
      performerId: performer._id,
      limit: itemPerPage,
      offset: productPage - 1
    });
    getVideosHandler({
      limit: itemPerPage,
      offset: videoPage - 1,
      performerId: performer._id,
      isSaleVideo: false
    });
    getVodsHandler({
      limit: itemPerPage,
      offset: videoPage - 1,
      performerId: performer._id,
      isSaleVideo: true
    });
  }

  async componentDidUpdate() {
    const { videos, saleVideos, products } = this.props;
    const { productPage, itemPerPage, vodPage, videoPage } = this.state;
    if (videos && videos.total) {
      const { total } = videos;
      // eslint-disable-next-line react/no-did-update-set-state
      await this.setState({
        canVidLoadMore: total > videoPage * itemPerPage
      });
    }
    if (saleVideos && saleVideos.total) {
      const { total } = saleVideos;
      // eslint-disable-next-line react/no-did-update-set-state
      await this.setState({
        canVodLoadMore: total > vodPage * itemPerPage
      });
    }
    if (products && products.total) {
      const { total } = products;
      // eslint-disable-next-line react/no-did-update-set-state
      await this.setState({
        canProductLoadMore: total > productPage * itemPerPage
      });
    }
  }

  loadMoreItem = async (performerId: string, type: string) => {
    const {
      moreVideo: moreVideoHandler,
      moreProduct: moreProductHandler
    } = this.props;
    const {
      canVidLoadMore,
      videoPage,
      itemPerPage,
      canVodLoadMore,
      vodPage,
      productPage,
      canProductLoadMore
    } = this.state;
    if (type === 'vid') {
      if (!canVidLoadMore) {
        return false;
      }
      await this.setState({
        videoPage: videoPage + 1
      });
      moreVideoHandler({
        limit: itemPerPage,
        offset: (videoPage - 1) * itemPerPage,
        performerId,
        isSaleVideo: false
      });
    }
    if (type === 'vod') {
      if (!canVodLoadMore) {
        return false;
      }
      await this.setState({
        vodPage: vodPage + 1
      });
      moreVideoHandler({
        limit: itemPerPage,
        offset: (vodPage - 1) * itemPerPage,
        performerId,
        isSaleVideo: true
      });
    }
    if (type === 'product') {
      if (!canProductLoadMore) {
        return false;
      }
      await this.setState({
        productPage: productPage + 1
      });
      moreProductHandler({
        limit: itemPerPage,
        offset: (productPage - 1) * itemPerPage,
        performerId
      });
    }

    return undefined;
  };

  async handleShowPhotosSlider(gallery: IGallery, performerId: string) {
    const { isSubscribed } = this.state;
    if (!isSubscribed) {
      return message.error('Subscribe to view full content!');
    }
    try {
      const resp = await (
        await photoService.userSearch(performerId, { galleryId: gallery._id })
      ).data.data;
      return this.setState({
        visibleModal: true,
        sellectedGallery: gallery,
        galleryPhotos: resp
      });
    } catch (e) {
      // console.log(e);
      // TODO - show error
      return undefined;
    }
  }

  handleClosePhotosSlider() {
    this.setState({ visibleModal: false });
  }

  async subscribe(performerId: string, type: string) {
    try {
      const subscription = await (
        await paymentService.subscribe({ type, performerId })
      ).data;
      // throw success now
      if (subscription) {
        message.success('Redirecting to payment method.');
        window.location.href = subscription.paymentUrl;
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    }
  }

  handleViewWelcomeVideo() {
    const video = document.getElementById('video') as HTMLVideoElement;
    video.pause();
    this.setState({ viewedVideo: false });
  }

  render() {
    const {
      performer,
      ui,
      currentUser,
      videos: videosVal,
      products: productsVal,
      saleVideos: saleVideosVal,
      galleries: galleriesVal
    } = this.props;
    const loadingVideo = videosVal.requesting || false;
    const videos = videosVal.items || [];
    const loadingVod = saleVideosVal.requesting || false;
    const saleVideos = saleVideosVal.items || [];
    const loadingPrd = productsVal.requesting || false;
    const products = productsVal.items || [];
    const galleries = galleriesVal.items || [];
    const {
      visibleModal,
      sellectedGallery,
      galleryPhotos,
      viewedVideo,
      isSubscribed,
      canVidLoadMore,
      canVodLoadMore,
      canProductLoadMore
    } = this.state;
    return (
      <>
        <Head>
          <title>
            {ui && ui.siteName} |{performer && performer.username}
          </title>
          <meta
            name="keywords"
            content={`${performer && performer.username}, ${
              performer && performer.name
            }`}
          />
          <meta name="description" content={performer && performer.bio} />
          {/* OG tags */}
          <meta
            property="og:title"
            content={
              ui && `${ui.siteName} | ${performer}` && performer.username
            }
            key="title"
          />
          <meta property="og:image" content={performer && performer.avatar} />
          <meta
            property="og:keywords"
            content={`${performer && performer.username}, ${
              performer && performer.name
            }`}
          />
          <meta
            property="og:description"
            content={performer && performer.bio}
          />
        </Head>
        <Layout>
          <Content>
            <div
              className="top-profile"
              style={{
                backgroundImage:
                  performer && performer.cover
                    ? `url('${performer.cover}')`
                    : "url('/banner-image.jpg')"
              }}
            >
              <div className="bg-2nd">
                <div className="main-container">
                  <div className="tab-stat">
                    <div className="tab-item">
                      <span>
                        {(performer && performer.stats.totalVideos) || 0} Vids
                      </span>
                    </div>
                    <div className="tab-item">
                      <span>
                        {(performer && performer.stats.totalPhotos) || 0} Pics
                      </span>
                    </div>
                    <div className="tab-item">
                      <span>
                        {(performer && performer.stats.totalProducts) || 0}{' '}
                        Items
                      </span>
                    </div>
                    <div className="tab-item">
                      <span>
                        {(performer && performer.stats.subscribers) || 0} Subs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="main-profile">
              <div className="main-container">
                <div className="fl-col">
                  <img
                    alt="Avatar"
                    src={
                      performer && performer.avatar
                        ? performer.avatar
                        : '/no-avatar.png'
                    }
                  />
                  <div className="m-user-name">
                    <h4>
                      {performer && performer.name ? performer.name : ''}
                      &nbsp;
                      <CheckCircleOutlined />
                    </h4>
                    <h5>@{performer && performer.username}</h5>
                  </div>
                </div>
                <div className="btn-grp">
                  {/* <button>Send Tip</button> */}
                  {currentUser &&
                    !currentUser.isPerformer &&
                    currentUser._id !==
                      ((performer && performer._id) || '') && (
                      <button className="normal" type="button">
                        <Link
                          href={{
                            pathname: '/messages',
                            query: {
                              toSource: 'performer',
                              toId: (performer && performer._id) || ''
                            }
                          }}
                        >
                          <span>Message</span>
                        </Link>
                      </button>
                    )}
                  {currentUser._id &&
                    !currentUser.isPerformer &&
                    !isSubscribed &&
                    performer &&
                    performer.yearlyPrice && (
                      <Button
                        className="secondary"
                        onClick={this.subscribe.bind(
                          this,
                          performer._id,
                          'yearly'
                        )}
                      >
                        Yearly Sub ${performer.yearlyPrice.toFixed(2)}
                      </Button>
                    )}
                  {currentUser._id &&
                    !currentUser.isPerformer &&
                    !isSubscribed &&
                    performer &&
                    performer.monthlyPrice && (
                      <Button
                        type="primary"
                        className="primary"
                        onClick={this.subscribe.bind(
                          this,
                          performer._id,
                          'monthly'
                        )}
                      >
                        Monthly Sub $
                        {performer && performer.monthlyPrice.toFixed(2)}
                      </Button>
                    )}
                </div>
                <div
                  className={
                    currentUser.isPerformer ? 'mar-0 pro-desc' : 'pro-desc'
                  }
                >
                  <div className="flex-row show-more">
                    <Collapse
                      expandIconPosition="right"
                      bordered={false}
                      expandIcon={({ isActive }) => (
                        <ArrowDownOutlined rotate={isActive ? 180 : 0} />
                      )}
                      className="site-collapse-custom-collapse"
                    >
                      <Panel
                        header="show more"
                        key="1"
                        className="site-collapse-custom-panel"
                      >
                        <PerformerInfo performer={performer && performer} />
                      </Panel>
                    </Collapse>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '20px' }} />
            <div className="main-container">
              <div className="model-content">
                <Tabs defaultActiveKey="Video" size="large">
                  <TabPane tab="Video" key="video">
                    {videos && videos.length > 0 && (
                      <PerformerListVideo videos={videos} />
                    )}
                    {loadingVideo && <p className="text-center">loading...</p>}
                    {!loadingVideo && !videos.length && (
                      <p className="text-center">No video found.</p>
                    )}
                    {videos && videos.length > 0 && canVidLoadMore && (
                      <p className="text-center">
                        <Button
                          onClick={this.loadMoreItem.bind(
                            this,
                            performer && performer._id,
                            'vid'
                          )}
                        >
                          i want more
                        </Button>
                      </p>
                    )}
                  </TabPane>
                  <TabPane tab="VOD" key="saleVideo">
                    {saleVideos && saleVideos.length > 0 && (
                      <PerformerListVideo videos={saleVideos} />
                    )}
                    {loadingVod && <p className="text-center">loading...</p>}
                    {!loadingVod && !saleVideos.length && (
                      <p className="text-center">No VOD found.</p>
                    )}
                    {saleVideos && saleVideos.length > 0 && canVodLoadMore && (
                      <p className="text-center">
                        <Button
                          onClick={this.loadMoreItem.bind(
                            this,
                            performer && performer._id,
                            'vod'
                          )}
                        >
                          i want more
                        </Button>
                      </p>
                    )}
                  </TabPane>
                  <TabPane tab="Photo" key="photo">
                    <Row>
                      {galleries &&
                        galleries.length > 0 &&
                        galleries.map((gallery: IGallery) => (
                          <Col
                            xs={12}
                            sm={12}
                            md={8}
                            lg={6}
                            xl={6}
                            key={gallery._id}
                            onClick={this.handleShowPhotosSlider.bind(
                              this,
                              gallery,
                              performer && performer._id
                            )}
                          >
                            <GalleryCard gallery={gallery} />
                          </Col>
                        ))}
                    </Row>
                    {!galleries.length && (
                      <p className="text-center">No gallery found.</p>
                    )}
                  </TabPane>
                  <TabPane tab="Store" key="store">
                    {products && products.length > 0 && (
                      <PerformerListProduct products={products} />
                    )}
                    {loadingPrd && <p className="text-center">loading...</p>}
                    {!loadingPrd && !products.length && (
                      <p className="text-center">No product found.</p>
                    )}
                    {products && products.length > 0 && canProductLoadMore && (
                      <p className="text-center">
                        <Button
                          onClick={this.loadMoreItem.bind(
                            this,
                            performer && performer._id,
                            'product'
                          )}
                        >
                          i want more
                        </Button>
                      </p>
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </div>
            {sellectedGallery && (
              <PhotosSlider
                gallery={sellectedGallery}
                photos={galleryPhotos}
                visible={visibleModal}
                subscribed={isSubscribed}
                onClose={this.handleClosePhotosSlider.bind(this)}
              />
            )}
            {performer &&
              performer.welcomeVideoPath &&
              performer.activateWelcomeVideo && (
                <Modal
                  key="welcome-video"
                  width={768}
                  visible={viewedVideo}
                  title="Welcome video"
                  onOk={this.handleViewWelcomeVideo.bind(this)}
                  onCancel={this.handleViewWelcomeVideo.bind(this)}
                  footer={[
                    <Button
                      type="primary"
                      onClick={this.handleViewWelcomeVideo.bind(this)}
                    >
                      Close
                    </Button>
                  ]}
                >
                  <video
                    autoPlay
                    src={performer.welcomeVideoPath}
                    controls
                    id="video"
                    style={{ width: '100%' }}
                  />
                </Modal>
              )}
          </Content>
        </Layout>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui,
  videos: { ...state.video.videos },
  saleVideos: { ...state.video.saleVideos },
  products: { ...state.product.products },
  galleries: { ...state.gallery.listGalleries },
  currentUser: { ...state.user.current }
});

const mapDispatch = {
  getVideos,
  moreVideo,
  getVods,
  listProducts,
  moreProduct,
  getGalleries,
  redirectToErrorPage
};
export default connect(mapStates, mapDispatch)(PerformerProfile);
