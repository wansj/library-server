'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildSchema = undefined;

var _graphqlTools = require('graphql-tools');

var _graphql = require('graphql');

var _graphqlSubscriptions = require('graphql-subscriptions');

var _graphqlRedisSubscriptions = require('graphql-redis-subscriptions');

var _resolvers = require('./resolvers');

var _resolvers2 = _interopRequireDefault(_resolvers);

var _settings = require('../settings');

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Types = require('./Types');
var Query = require('./Query');
var Mutation = require('./Mutation');
var Subscription = require('./Subscription');
var pubsub = new _graphqlRedisSubscriptions.RedisPubSub();

// import { GetLogedUserIDQuery } from './constants'
var iconv = require('iconv-lite');

var generateRemoteSchema = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    var fetcher, schema, executableSchema;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            /**
             * 此处不能使用JSON.stringify({ query, variables, operationName })，否则会使variables: {file: Promise}变成{file: {}}
             */
            fetcher = function () {
              var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref2) {
                var query = _ref2.query,
                    variables = _ref2.variables,
                    operationName = _ref2.operationName,
                    context = _ref2.context;

                var body, _ref4, stream, filename, mimetype, encoding, result, fetchResult;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        body = Object.assign({}, { query: query, variables: variables, operationName: operationName });

                        if (!(variables && variables.file)) {
                          _context2.next = 15;
                          break;
                        }

                        _context2.next = 4;
                        return variables.file;

                      case 4:
                        _ref4 = _context2.sent;
                        stream = _ref4.stream;
                        filename = _ref4.filename;
                        mimetype = _ref4.mimetype;
                        encoding = _ref4.encoding;
                        _context2.next = 11;
                        return new Promise(function (resolve, reject) {
                          stream.pipe(iconv.decodeStream('base64')).collect(function (err, body) {
                            if (err) reject(err);else resolve(body);
                          });
                        });

                      case 11:
                        stream = _context2.sent;

                        body.variables.file = { stream: stream, filename: filename, mimetype: mimetype, encoding: encoding };
                        _context2.next = 20;
                        break;

                      case 15:
                        if (!(variables && variables.files)) {
                          _context2.next = 20;
                          break;
                        }

                        _context2.next = 18;
                        return Promise.all(variables.files.map(function (promise) {
                          return promise.then(function () {
                            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref5) {
                              var stream = _ref5.stream,
                                  filename = _ref5.filename,
                                  mimetype = _ref5.mimetype,
                                  encoding = _ref5.encoding;
                              return regeneratorRuntime.wrap(function _callee$(_context) {
                                while (1) {
                                  switch (_context.prev = _context.next) {
                                    case 0:
                                      _context.next = 2;
                                      return new Promise(function (resolve, reject) {
                                        stream.pipe(iconv.decodeStream('base64')).collect(function (err, body) {
                                          if (err) reject(err);else resolve(body);
                                        });
                                      });

                                    case 2:
                                      stream = _context.sent;
                                      return _context.abrupt('return', { stream: stream, filename: filename, mimetype: mimetype, encoding: encoding });

                                    case 4:
                                    case 'end':
                                      return _context.stop();
                                  }
                                }
                              }, _callee, undefined);
                            }));

                            return function (_x2) {
                              return _ref6.apply(this, arguments);
                            };
                          }());
                        }));

                      case 18:
                        result = _context2.sent;

                        body.variables.files = result;

                      case 20:
                        body = JSON.stringify(body);
                        _context2.next = 23;
                        return (0, _nodeFetch2.default)(_settings.remoteSchemaUrl, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: body
                        });

                      case 23:
                        fetchResult = _context2.sent;
                        return _context2.abrupt('return', fetchResult.json());

                      case 25:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, undefined);
              }));

              return function fetcher(_x) {
                return _ref3.apply(this, arguments);
              };
            }();

            _context3.next = 3;
            return (0, _graphqlTools.introspectSchema)(fetcher);

          case 3:
            schema = _context3.sent;
            executableSchema = (0, _graphqlTools.makeRemoteExecutableSchema)({
              schema: schema,
              fetcher: fetcher
            });
            return _context3.abrupt('return', executableSchema);

          case 6:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function generateRemoteSchema() {
    return _ref.apply(this, arguments);
  };
}();

var generateUserSchema = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var fetcher, schema, executableSchema;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            fetcher = function () {
              var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref8) {
                var query = _ref8.query,
                    variables = _ref8.variables,
                    operationName = _ref8.operationName,
                    context = _ref8.context;
                var headers, fetchResult;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        headers = { 'Content-Type': 'application/json'
                          // 这里要注意的是context是{graphqlContext: {db,client,authorization}}形式的，直接使用官网文档上context.authorization是不对的
                        };
                        if (context && context.graphqlContext.authorization) headers.authorization = context.graphqlContext.authorization;
                        _context4.next = 4;
                        return (0, _nodeFetch2.default)(_settings.remoteSchemaUrl2, {
                          headers: headers,
                          method: 'POST',
                          // 由于UserService中使用的是apollo-server-core2.0，query必须是string,所以必须使用print将query转化成string
                          // 解决方法来自于https://github.com/apollographql/graphql-tools/issues/891
                          body: JSON.stringify({ query: (0, _graphql.print)(query), variables: variables, operationName: operationName })
                        });

                      case 4:
                        fetchResult = _context4.sent;
                        return _context4.abrupt('return', fetchResult.json());

                      case 6:
                      case 'end':
                        return _context4.stop();
                    }
                  }
                }, _callee4, undefined);
              }));

              return function fetcher(_x3) {
                return _ref9.apply(this, arguments);
              };
            }();

            _context5.next = 3;
            return (0, _graphqlTools.introspectSchema)(fetcher);

          case 3:
            schema = _context5.sent;
            executableSchema = (0, _graphqlTools.makeRemoteExecutableSchema)({
              schema: schema,
              fetcher: fetcher
            });
            return _context5.abrupt('return', executableSchema);

          case 6:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function generateUserSchema() {
    return _ref7.apply(this, arguments);
  };
}();
var buildSchema = exports.buildSchema = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
    var fileSchema, userSchema, bookSchema, linkTypeDefs, schema;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return generateRemoteSchema();

          case 2:
            fileSchema = _context9.sent;
            _context9.next = 5;
            return generateUserSchema();

          case 5:
            userSchema = _context9.sent;
            bookSchema = (0, _graphqlTools.makeExecutableSchema)({
              typeDefs: [Query, Mutation, Subscription, Types],
              resolvers: _resolvers2.default
            });
            linkTypeDefs = '\n    extend type Book {\n      picture: File\n    }\n    extend type File {\n      book: Book\n      buggy: BugReport\n    }\n    extend type User {\n      photo: File\n      statistics: Statistics\n    }\n    extend type Record {\n      user: User\n    }\n    extend type BookComment {\n      user: User\n    }\n    extend type Feedback {\n      postedUser: User\n    }\n    extend type Subscription {\n      friendAdded(userId: String!): Friend\n      friendApproved(userId: String!): Friend\n      tokenExpired(token: String): String\n    }\n  ';
            schema = (0, _graphqlTools.mergeSchemas)({
              schemas: [bookSchema, fileSchema, userSchema, linkTypeDefs],
              resolvers: function resolvers(mergeInfo) {
                return {
                  Book: {
                    picture: {
                      fragment: 'fragment BookFragment on Book { cover }',
                      resolve: function resolve(parent, args, context, info) {
                        var id = parent.cover;
                        if (!id) return '';
                        var promise = mergeInfo.delegate('query', 'fileByID', { id: id }, context, info);
                        // 如果id不是null，但是查询不到File的话，说明外键cover已失效（对应的图片已删除），将cover置null。
                        // 这样就不必在删除图片的时候做关联更新了
                        promise.then(function (data) {
                          if (!data && id) {
                            mergeInfo.delegate('mutation', 'updateBookByID', { id: parent.id, book: { cover: null } }, context, info);
                          }
                        });
                        return promise;
                      }
                    }
                  },
                  File: {
                    book: {
                      fragment: 'fragment FileFragment on File { id }',
                      resolve: function resolve(parent, args, context, info) {
                        var id = parent.id;
                        if (id === null) return '';
                        return mergeInfo.delegate('query', 'bookByCoverID', { id: id }, context, info);
                      }
                    },
                    buggy: {
                      fragment: 'fragment FileFragment on File { id }',
                      resolve: function resolve(parent, args, context, info) {
                        var id = parent.id;
                        if (id === null) return '';
                        return mergeInfo.delegate('query', 'buggy', { id: id }, context, info);
                      }
                    }
                  },
                  User: {
                    photo: {
                      fragment: 'fragment UserFragment on User { avatar }',
                      resolve: function resolve(parent, args, context, info) {
                        if (!parent.avatar) return '';
                        return mergeInfo.delegate('query', 'fileByID', { id: parent.avatar }, context, info);
                      }
                    },
                    statistics: {
                      fragment: 'fragment UserFragment2 on User { id }',
                      resolve: function resolve(parent, args, context, info) {
                        if (!parent.id) return null;
                        return mergeInfo.delegate('query', 'userStatistics', { userId: parent.id }, context, info);
                      }
                    }

                  },
                  Record: {
                    user: {
                      fragment: 'fragment RecordFragment on Record { userId }',
                      resolve: function resolve(parent, args, context, info) {
                        if (!parent.userId) return null;
                        return mergeInfo.delegate('query', 'user', { id: parent.userId }, context, info);
                      }
                    }
                  },
                  BookComment: {
                    user: {
                      fragment: 'fragment BookCommentUser on BookComment { userId }',
                      resolve: function resolve(parent, args, context, info) {
                        if (!parent.userId) return null;
                        return mergeInfo.delegate('query', 'user', { id: parent.userId }, context, info);
                      }
                    }
                  },
                  Feedback: {
                    postedUser: {
                      fragment: 'fragment FeedbackFragment on Feedback { postBy }',
                      resolve: function resolve(parent, args, context, info) {
                        if (!parent.postBy) return null;
                        return mergeInfo.delegate('query', 'user', { id: parent.postBy }, context, info);
                      }
                    }
                  },
                  Subscription: {
                    friendAdded: {
                      subscribe: (0, _graphqlSubscriptions.withFilter)(function () {
                        return pubsub.asyncIterator('friendAdded');
                      }, function () {
                        var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(payload, variables, context) {
                          return regeneratorRuntime.wrap(function _callee6$(_context6) {
                            while (1) {
                              switch (_context6.prev = _context6.next) {
                                case 0:
                                  return _context6.abrupt('return', payload.friendAdded.friend === variables.userId);

                                case 1:
                                case 'end':
                                  return _context6.stop();
                              }
                            }
                          }, _callee6, undefined);
                        }));

                        return function (_x4, _x5, _x6) {
                          return _ref11.apply(this, arguments);
                        };
                      }())
                    },
                    friendApproved: {
                      subscribe: (0, _graphqlSubscriptions.withFilter)(function () {
                        return pubsub.asyncIterator('friendApproved');
                      }, function () {
                        var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(payload, variables, context) {
                          return regeneratorRuntime.wrap(function _callee7$(_context7) {
                            while (1) {
                              switch (_context7.prev = _context7.next) {
                                case 0:
                                  console.log(payload.friendApproved.whose);
                                  console.log(variables.userId);
                                  return _context7.abrupt('return', payload.friendApproved.whose === variables.userId);

                                case 3:
                                case 'end':
                                  return _context7.stop();
                              }
                            }
                          }, _callee7, undefined);
                        }));

                        return function (_x7, _x8, _x9) {
                          return _ref12.apply(this, arguments);
                        };
                      }())
                    },
                    tokenExpired: {
                      subscribe: (0, _graphqlSubscriptions.withFilter)(function () {
                        return pubsub.asyncIterator('tokenExpired');
                      }, function () {
                        var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(payload, variables, context) {
                          return regeneratorRuntime.wrap(function _callee8$(_context8) {
                            while (1) {
                              switch (_context8.prev = _context8.next) {
                                case 0:
                                  console.log(payload.tokenExpired);
                                  console.log(context.authToken.replace('Bearer ', ''));
                                  return _context8.abrupt('return', payload.tokenExpired === context.authToken.replace('Bearer ', ''));

                                case 3:
                                case 'end':
                                  return _context8.stop();
                              }
                            }
                          }, _callee8, undefined);
                        }));

                        return function (_x10, _x11, _x12) {
                          return _ref13.apply(this, arguments);
                        };
                      }())
                    }
                  }
                };
              }
            });
            return _context9.abrupt('return', schema);

          case 10:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined);
  }));

  return function buildSchema() {
    return _ref10.apply(this, arguments);
  };
}();
//# sourceMappingURL=schema.js.map