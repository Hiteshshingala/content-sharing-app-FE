// import Routes from 'next-routes';
const routes = require('next-routes');

/**
 * routes.add([name], pattern = /name, page = name)
   routes.add(object)
 */

export default routes()
  .add('top-models', '/top-models', '/model/top-models')
  .add('account', '/model/account', '/model/account')
  .add('model', '/model/:username', '/model/profile')
  .add('video', '/video/:id', '/video')
  .add('store', '/store/:id', '/store')
  .add('page', '/page/:id', '/page');
