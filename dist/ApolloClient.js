'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getClient = undefined;

var _apolloClient = require('apollo-client');

var _apolloLinkHttp = require('apollo-link-http');

var _apolloCacheInmemory = require('apollo-cache-inmemory');

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*使用ApolloClient来实现microservices之间的互相调用，client对象存储在context里，
在resolver中可以通过context.client.query|mutate来调用其他微服务（如UploadService）*/
// export const client = new ApolloClient({
//   link: new HttpLink({ uri: localUrl, fetch: fetch }),
//   cache: new InMemoryCache()
// })
var getClient = exports.getClient = function getClient(token) {
  var customFetch = function customFetch(uri, options) {
    if (token) options.headers.Authorization = token;
    return (0, _nodeFetch2.default)(uri, options);
  };
  return new _apolloClient.ApolloClient({
    link: (0, _apolloLinkHttp.createHttpLink)({ uri: _settings.localUrl, fetch: customFetch }),
    cache: new _apolloCacheInmemory.InMemoryCache()
  });
};
//# sourceMappingURL=ApolloClient.js.map