import React from 'react';
import App from 'next/app';
import { Provider } from 'react-redux';
import nextCookie from 'next-cookies';
import withReduxSaga from '@redux/withReduxSaga';
import { Store } from 'redux';
import BaseLayout from '@layouts/base-layout';
import {
  authService,
  userService,
  performerService,
  settingService
} from '@services/index';
import Router from 'next/router';
import { NextPageContext } from 'next';
import { loginSuccess } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { updateUIValue } from '@redux/ui/actions';
import '../style/index.less';
import { Socket } from 'src/socket';
import Head from 'next/head';

declare global {
  interface Window {
    ReactSocketIO: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
}

function setCookie(cname, cvalue, exTime) {
  const d = new Date();
  d.setTime(d.getTime() + exTime * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function checkGeoCookie() {
  const checkGeo = getCookie('checkGeoBlock');
  return checkGeo !== '';
}

function redirectLogin(ctx: any) {
  if (process.browser) {
    authService.removeToken();
    return Router.push('/auth/login');
  }

  // fix for production build
  ctx.res.clearCookie && ctx.res.clearCookie('token');
  ctx.res.clearCookie && ctx.res.clearCookie('role');
  ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/auth/login' });
  ctx.res.end && ctx.res.end();
  return undefined;
}

async function auth(
  ctx: NextPageContext,
  noredirect: boolean,
  onlyPerformer: boolean
) {
  try {
    const { store } = ctx;
    const state = store.getState();
    if (state.auth && state.auth.loggedIn) {
      return undefined;
    }
    // TODO - move to a service
    const { token, role } = nextCookie(ctx);
    if (token) {
      authService.setAuthHeaderToken(token);
      let user = null;
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
      store.dispatch(loginSuccess());
      store.dispatch(updateCurrentUser(user.data));
      if (!user.data.isPerformer && onlyPerformer) {
        redirectLogin(ctx);
      }
      return undefined;
    }
    return noredirect ? undefined : redirectLogin(ctx);
  } catch (e) {
    return redirectLogin(ctx);
  }
}

async function updateSettingsStore(ctx: NextPageContext, settings) {
  try {
    const { store } = ctx;
    store.dispatch(
      updateUIValue({
        logo: settings.logoUrl,
        siteName: settings.siteName,
        favicon: settings.favicon,
        menus: settings.menus
      })
    );

    // TODO - update others like meta data
  } catch (e) {
    // TODO - implement me
    // console.log(e);
  }
}

interface AppComponent extends NextPageContext {
  layout: string;
}

interface IApp {
  store: Store;
  layout: string;
  authenticate: boolean;
  Component: AppComponent;
  settings: any;
  geoBlocked: boolean;
}

class Application extends App<IApp> {
  static settingQuery = false;

  // TODO - consider if we need to use get static props in children component instead?
  // or check in render?
  static async getInitialProps({ Component, ctx }) {
    // won't check auth for un-authenticated page such as login, register
    // use static field in the component
    if (Component.authenticate !== false) {
      const { noredirect } = Component;
      const { onlyPerformer } = Component;
      await auth(ctx, noredirect, onlyPerformer);
    }
    const { token } = nextCookie(ctx);
    ctx.token = token || '';
    // server side to load settings, once time only
    let settings = {};
    let geoBlocked = false;
    if (process.browser && !checkGeoCookie()) {
      const checkBlock = (await userService.checkCountryBlock()) as any;
      // set interval check every single hour
      setCookie('checkGeoBlock', true, 1);
      if (checkBlock && checkBlock.data && checkBlock.data.blocked) {
        geoBlocked = true;
      }
    }
    if (!process.browser) {
      const resp = await settingService.all();
      // TODO encrypt, decypt header script, footer script or other info if needed
      settings = resp.data;
      await updateSettingsStore(ctx, settings);
    }
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ ctx });
    }
    return {
      geoBlocked,
      settings,
      pageProps,
      layout: Component.layout
    };
  }

  render() {
    const { Component, pageProps, store, settings, geoBlocked } = this.props;
    const { layout } = Component;
    return (
      <Provider store={store}>
        <Head>
          <title>{settings && settings.siteName}</title>
          <link rel="icon" href={settings && settings.favicon} sizes="64x64" />
          <meta name="keywords" content={settings && settings.metaKeywords} />
          <meta
            name="description"
            content={settings && settings.metaDescription}
          />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          {/* OG tags */}
          <meta
            property="og:title"
            content={settings && settings.siteName}
            key="title"
          />
          <meta property="og:image" content={settings && settings.logoUrl} />
          <meta
            property="og:keywords"
            content={settings && settings.metaKeywords}
          />
          <meta
            property="og:description"
            content={settings && settings.metaDescription}
          />
          {/* GA code */}
          {settings && settings.gaCode && (
            <script
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', '${settings.gaCode}');`
              }}
            />
          )}
          {/* extra script */}
          {settings && settings.headerScript && (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: settings.headerScript }} />
          )}
        </Head>
        <Socket>
          <BaseLayout
            layout={layout}
            maintenance={settings.maintenanceMode}
            geoBlocked={geoBlocked}
          >
            <Component {...pageProps} />
          </BaseLayout>
        </Socket>
        {/* extra script */}
        {settings && settings.afterBodyScript && (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: settings.afterBodyScript }} />
        )}
      </Provider>
    );
  }
}

export default withReduxSaga(Application);
