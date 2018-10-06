'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require('regenerator-runtime/runtime');

var _schema = require('./graphql/schema');

var _apolloUploadServer = require('apollo-upload-server');

var _typeIs = require('type-is');

var _typeIs2 = _interopRequireDefault(_typeIs);

var _apolloServerCore = require('apollo-server-core');

var _Book = require('./models/Book');

var _Book2 = _interopRequireDefault(_Book);

var _BookComment = require('./models/BookComment');

var _BookComment2 = _interopRequireDefault(_BookComment);

var _Category = require('./models/Category');

var _Category2 = _interopRequireDefault(_Category);

var _BugReport = require('./models/BugReport');

var _BugReport2 = _interopRequireDefault(_BugReport);

var _Record = require('./models/Record');

var _Record2 = _interopRequireDefault(_Record);

var _Collection = require('./models/Collection');

var _Collection2 = _interopRequireDefault(_Collection);

var _Cart = require('./models/Cart');

var _Cart2 = _interopRequireDefault(_Cart);

var _Reserve = require('./models/Reserve');

var _Reserve2 = _interopRequireDefault(_Reserve);

var _Conversation = require('./models/Conversation');

var _Conversation2 = _interopRequireDefault(_Conversation);

var _Post = require('./models/Post');

var _Post2 = _interopRequireDefault(_Post);

var _Feedback = require('./models/Feedback');

var _Feedback2 = _interopRequireDefault(_Feedback);

var _ReadPlan = require('./models/ReadPlan');

var _ReadPlan2 = _interopRequireDefault(_ReadPlan);

var _url = require('url');

var url = _interopRequireWildcard(_url);

var _graphql = require('graphql');

var _http = require('http');

var _subscriptionsTransportWs = require('subscriptions-transport-ws');

var _ApolloClient = require('./ApolloClient');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('apollo-server-micro'),
    microGraphiql = _require.microGraphiql;

var _require2 = require('micro'),
    send = _require2.send,
    json = _require2.json;

var _require3 = require('microrouter'),
    get = _require3.get,
    post = _require3.post,
    options = _require3.options,
    router = _require3.router;

var db = require('./db');
var cors = require('micro-cors')();
var bodyParser = require('body-parser');
// import { GetLogedUserIDQuery } from './graphql/constants'


// Create WebSocket listener server
var ws = (0, _http.createServer)(function (req, res) {
  res.writeHead(404);
  res.end();
});
ws.listen('5000', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
  var schema;
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _schema.buildSchema)();

        case 2:
          schema = _context2.sent;

          new _subscriptionsTransportWs.SubscriptionServer({
            execute: _graphql.execute,
            subscribe: _graphql.subscribe,
            schema: schema,
            onOperation: function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(message, params) {
                var token, options;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        token = message.payload.authToken;
                        options = _extends({}, params, { context: _extends({}, params.context) });

                        if (token) {
                          options.context.authToken = token;
                          // const client = getClient(token)
                          // try {
                          //   const {data: {logedUser}} = await client.query({query: GetLogedUserIDQuery})
                          //   options.context.authToken = token
                          // } catch (e) { }
                        }
                        return _context.abrupt('return', options);

                      case 4:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              }));

              function onOperation(_x, _x2) {
                return _ref2.apply(this, arguments);
              }

              return onOperation;
            }()
            // onConnect: async (connectionParams, webSocket) => {
            //   if (connectionParams.authorization) {
            //     console.log(connectionParams.authorization)
            //     const client = getClient(connectionParams.authorization)
            //     const { data: { logedUser } } = await client.query({query: GetLogedUserIDQuery})
            //     return { currentUser: logedUser.id }
            //   }
            //   throw new Error('Missing auth token!');
            // }
          }, {
            server: ws,
            path: '/subscriptions'
          });

        case 4:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, undefined);
})));
ws.on('error', function (e) {
  console.log(e);
});
/**
 * 此处需要注意：graphqlHandler可以是异步函数，但是它必须接受req和res两个参数。因为microGraphql({})返回的是
 * async (req, res) => {}形式的函数，否则会报："string" must be a string的错误，因为不识别graphqlHandler
 * 将其作为字符串来解析了。
 **/
//micro的res对象是通过直接函数返回值返回客户端的，与express有巨大差异。
//由于使用body-parser使graphqlHandler多层嵌套，内层函数返回值无法返回返回外层，
// 所以使用Promise以及async/await来实现同步等待并接收内层函数返回值
var graphqlHandler = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
    var context, gglResponse;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            // console.log(req.headers.authorization)
            context = {
              db: db,
              client: (0, _ApolloClient.getClient)(req.headers.authorization),
              authorization: req.headers.authorization
            };
            _context4.next = 3;
            return new Promise(function (resolve, reject) {
              var next = function () {
                var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(err) {
                  var schema;
                  return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          if (!(err instanceof Error)) {
                            _context3.next = 2;
                            break;
                          }

                          throw err;

                        case 2:
                          if (!(0, _typeIs2.default)(req, ['multipart/form-data'])) {
                            _context3.next = 8;
                            break;
                          }

                          _context3.next = 5;
                          return (0, _apolloUploadServer.processRequest)(req);

                        case 5:
                          req.body = _context3.sent;
                          _context3.next = 21;
                          break;

                        case 8:
                          if (!(req.method === 'POST')) {
                            _context3.next = 20;
                            break;
                          }

                          _context3.prev = 9;
                          _context3.next = 12;
                          return json(req);

                        case 12:
                          req.body = _context3.sent;
                          _context3.next = 18;
                          break;

                        case 15:
                          _context3.prev = 15;
                          _context3.t0 = _context3['catch'](9);

                          req.body = undefined;

                        case 18:
                          _context3.next = 21;
                          break;

                        case 20:
                          req.query = url.parse(req.url, true).query;

                        case 21:
                          _context3.next = 23;
                          return (0, _schema.buildSchema)();

                        case 23:
                          schema = _context3.sent;

                          // console.log(req.headers.authorization)
                          (0, _apolloServerCore.runHttpQuery)([req, res], {
                            method: req.method,
                            options: {
                              schema: schema,
                              context: context
                            },
                            query: req.method === 'POST' ? req.body : req.query
                          }).then(function (response) {
                            return resolve(response);
                          }).catch(function (err) {
                            return reject(err);
                          });

                        case 25:
                        case 'end':
                          return _context3.stop();
                      }
                    }
                  }, _callee3, undefined, [[9, 15]]);
                }));

                return function next(_x5) {
                  return _ref4.apply(this, arguments);
                };
              }();
              bodyParser.json()(req, res, next);
            });

          case 3:
            gglResponse = _context4.sent;
            return _context4.abrupt('return', gglResponse);

          case 5:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function graphqlHandler(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();
graphqlHandler = cors(graphqlHandler);
var graphiqlHandler = microGraphiql({
  endpointURL: '/graphql'
});
var server = router(options('/graphql', cors()), get('/graphql', graphqlHandler), post('/graphql', graphqlHandler), get('/graphiql', graphiqlHandler), post('/graphiql', graphiqlHandler), function (req, res) {
  return send(res, 404, 'not found');
});

module.exports = server;
//# sourceMappingURL=index.js.map