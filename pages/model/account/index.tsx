import React, { PureComponent } from 'react';
import Head from 'next/head';
import { connect } from 'react-redux';
import { Tabs, message } from 'antd';
import Page from '@components/common/layout/page';
import { PerformerAccountForm } from '@components/performer/accountForm';
import { PerformerBankingForm } from '@components/performer/bankingForm';
import {
  IPerformer,
  IUpdatePerformer,
  IBanking,
  IUIConfig,
  ICountry,
  IBlockCountries
} from 'src/interfaces';
import {
  updatePerformer,
  updateCurrentUserAvatar,
  updateBanking,
  updateCurrentUserCover,
  updateBlockCountries
} from 'src/redux/user/actions';
import { authService, performerService, utilsService } from '@services/index';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import {
  PerformerSubscriptionForm,
  PerformerBlockCountriesForm
} from '@components/performer';
import _ from 'lodash';
import Router from 'next/router';
import { getResponseError } from '@lib/utils';

interface IProps {
  currentUser: IPerformer;
  updatePerformer: Function;
  updating?: boolean;
  updateCurrentUserAvatar: Function;
  updateBanking: Function;
  ui: IUIConfig;
  updateCurrentUserCover: Function;
  countries: ICountry[];
  updateBlockCountries: Function;
}
class AccountSettings extends PureComponent<IProps> {
  static authenticate: boolean = true;

  state = {
    pwUpdating: false
  };

  static async getInitialProps() {
    const [countries] = await Promise.all([await utilsService.countriesList()]);
    return {
      countries: countries.data
    };
  }

  componentDidMount() {
    const { currentUser } = this.props;
    if (!currentUser || (currentUser && !currentUser.isPerformer)) {
      message.error('You have no permission on this page!');
      Router.push('/home');
    }
  }

  onAvatarUploaded(data: any) {
    const {
      updateCurrentUserAvatar: updateCurrentUserAvatarHandler
    } = this.props;
    message.success('Changes saved.');
    updateCurrentUserAvatarHandler(data.base64);
  }

  onCoverUploaded(data: any) {
    const {
      updateCurrentUserCover: updateCurrentUserCoverHandler
    } = this.props;
    message.success('Changes saved.');
    updateCurrentUserCoverHandler(data.base64);
  }

  async handleUpdateBlockCountries(data: IBlockCountries) {
    try {
      const {
        currentUser,
        updateBlockCountries: updateBlockCountriesHandler
      } = this.props;
      const info = Object.assign(data, {
        performerId: currentUser._id
      });
      const resp = await performerService.updateBlockCountries(
        currentUser._id,
        info
      );
      if (resp.data) {
        updateBlockCountriesHandler(resp.data);
      }
      message.success('Changes saved.');
    } catch (error) {
      message.error(
        getResponseError(error) || 'An error orccurred, please try again.'
      );
    }
  }

  async handleUpdateBanking(data: IBanking) {
    try {
      const { currentUser, updateBanking: updateBankingHandler } = this.props;
      const bankInfo = Object.assign(data, {
        performerId: currentUser._id
      });
      await updateBankingHandler(bankInfo);
      message.success('Changes saved.');
    } catch (error) {
      message.error(
        getResponseError(error) || 'An error orccurred, please try again.'
      );
    }
  }

  async submit(type: string, data: any) {
    console.log(data);
    try {
      const {
        currentUser,
        updatePerformer: updatePerformerHandler
      } = this.props;
      if (type === 'subscription') {
        const performer = _.pick(currentUser, [
          '_id',
          'email',
          'gender',
          'monthlyPrice',
          'yearlyPrice'
        ]) as IUpdatePerformer;
        performer.monthlyPrice = parseFloat(data.monthlyPrice);
        performer.yearlyPrice = parseFloat(data.yearlyPrice);
        await updatePerformerHandler(performer);
      }
      if (type === 'basic') {
        await updatePerformerHandler({
          ...currentUser,
          ...data,
          name: `${data.firstName} ${data.lastName}`
        });
      }
      message.success('Changes saved.');
    } catch (error) {
      const err = await Promise.resolve(error);
      message.error(
        err && err.message
          ? err.message
          : 'Something went wrong, please try again.'
      );
    }
  }

  async updatePassword(data: any) {
    try {
      this.setState({ pwUpdating: true });
      await authService.updatePassword(data.password, 'email', 'performer');
      message.success('Changes saved.');
    } catch (e) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ pwUpdating: false });
    }
  }

  render() {
    const { currentUser, updating, ui, countries } = this.props;
    const { pwUpdating } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <>
        <Head>
          <title>{ui && ui.siteName} | My Account </title>
        </Head>
        <Page>
          <div className="main-container">
            <Tabs
              defaultActiveKey="basic"
              tabPosition="top"
              className="nav-tabs"
            >
              <Tabs.TabPane tab={<span>Basic Information</span>} key="basic">
                <PerformerAccountForm
                  onFinish={this.submit.bind(this, 'basic')}
                  user={currentUser}
                  updating={updating}
                  options={{
                    uploadHeaders,
                    avatarUploadUrl: performerService.getAvatarUploadUrl(),
                    onAvatarUploaded: this.onAvatarUploaded.bind(this),
                    coverUploadUrl: performerService.getCoverUploadUrl(),
                    onCoverUploaded: this.onCoverUploaded.bind(this),
                    videoUploadUrl: performerService.getVideoUploadUrl()
                  }}
                  countries={countries}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={<span>Banking Information</span>}
                key="bankInfo"
              >
                <PerformerBankingForm
                  onFinish={this.handleUpdateBanking.bind(this)}
                  updating={updating}
                  user={currentUser}
                  countries={countries}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={<span>Subscription Information</span>}
                key="subscription"
              >
                <PerformerSubscriptionForm
                  onFinish={this.submit.bind(this, 'subscription')}
                  updating={updating}
                  user={currentUser}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Block Countries</span>} key="block">
                <PerformerBlockCountriesForm
                  onFinish={this.handleUpdateBlockCountries.bind(this)}
                  updating={updating}
                  blockCountries={currentUser.blockCountries}
                  countries={countries}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Change Password</span>} key="password">
                <UpdatePaswordForm
                  onFinish={this.updatePassword.bind(this)}
                  updating={pwUpdating}
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </Page>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  currentUser: state.user.current,
  updating: state.user.updating,
  ui: state.ui
});
const mapDispatch = {
  updatePerformer,
  updateCurrentUserAvatar,
  updateBanking,
  updateCurrentUserCover,
  updateBlockCountries
};
export default connect(mapStates, mapDispatch)(AccountSettings);
