'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _templateObject = _taggedTemplateLiteral(['\n                    mutation DeleteCoverMutation($id: ID!) {\n                      delFileByID(id: $id) {\n                        id\n                      }\n                    }\n                  '], ['\n                    mutation DeleteCoverMutation($id: ID!) {\n                      delFileByID(id: $id) {\n                        id\n                      }\n                    }\n                  ']);

var _graphqlSubscriptions = require('graphql-subscriptions');

var _graphqlRedisSubscriptions = require('graphql-redis-subscriptions');

var _graphqlTag = require('graphql-tag');

var _graphqlTag2 = _interopRequireDefault(_graphqlTag);

var _graphql = require('graphql');

var _language = require('graphql/language');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _settings = require('../settings');

var _transactions = require('./transactions');

var _transactions2 = _interopRequireDefault(_transactions);

var _constants = require('./constants');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
                                                                                                                                                                                                                              * 对于Enum类型，如果不希望使用其name作为value,可以在resolver中以：
                                                                                                                                                                                                                              * EnumTypeName: {
                                                                                                                                                                                                                              *    key1: value1,
                                                                                                                                                                                                                              *    key2: value2
                                                                                                                                                                                                                              *        .
                                                                                                                                                                                                                              *        .
                                                                                                                                                                                                                              *        .
                                                                                                                                                                                                                              * }这种形式来提供resolver。
                                                                                                                                                                                                                              * 目前我所知的定义Enum的语法：enum ColorTypes { RED BLUE BLACK }只支持一维的Values([value1, value2...])，
                                                                                                                                                                                                                              * 不支持二维的Values(例如[{key1: value1},{key2: value2}...])
                                                                                                                                                                                                                              * https://www.apollographql.com/docs/graphql-tools/scalars.html中Internal Values有介绍Enum的用法
                                                                                                                                                                                                                              **/


var getChildren = function getChildren(categories, parent) {
  var children = [];
  categories.forEach(function (category) {
    if (category.parent === parent) {
      children.push(category._id);
      children = children.concat(getChildren(categories, category._id));
    }
  });
  return children;
};
_moment2.default.locale('zh-cn', {
  meridiem: function meridiem(hour, minute, isLowercase) {
    if (hour >= 2 && hour < 5) return '凌晨';else if (hour >= 5 && hour < 8) return '早晨';else if (hour >= 8 && hour < 12) return '上午';else if (hour >= 12 && hour < 14) return '中午';else if (hour >= 14 && hour < 18) return '下午';else if (hour >= 18 && hour < 22) return '晚上';else return '深夜';
  },
  weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
});
var pubsub = new _graphqlRedisSubscriptions.RedisPubSub();
var POST_ADDED = 'postAdded';
// const FRIEND_ADDED = 'friendAdded'
var resolvers = {
  Date: new _graphql.GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: function parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize: function serialize(value) {
      if (value instanceof Date) return value.getTime(); // value sent to the client
      else return new Date(value).getTime();
    },
    parseLiteral: function parseLiteral(ast) {
      if (ast.kind === _language.Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    }
  }),
  Upload: new _graphql.GraphQLScalarType({
    name: 'Upload',
    description: 'The `Upload` scalar type represents a file upload promise that resolves ' + 'an object containing `stream`, `filename`, `mimetype` and `encoding`.',
    // value from the client
    parseValue: function parseValue(value) {
      return value;
    },

    // ast value is always in string format
    parseLiteral: function parseLiteral(ast) {
      throw new Error('Upload scalar literal unsupported');
    },

    // value sent to the client
    serialize: function serialize(value) {
      return value;
      // return JSON.stringify(value)
    }
  }),
  File: {
    id: function id(obj, args, context) {
      // console.log(obj)
      return obj.id;
    },
    file: function file(obj, args, context) {
      var id = obj.id,
          rest = _objectWithoutProperties(obj, ['id']);

      return rest;
    }
  },
  Book: {
    id: function id(obj, args, context) {
      return obj._id || obj.id;
    },

    // 计算count时减去已预定的数量。
    scheduledCount: function scheduledCount(obj, args, context) {
      var _this = this;

      var Reserve = context.db.model('Reserve');
      return new Promise(function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
          var aggregate, result, _result, first;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;

                  // 不能直接使用BorrowPlan.count({bookIds: obj._id})原因是obj._id是对象，不能简单的用eq来判断相等
                  // 所以只好先用个pipeline把当前所有已预约的图书全选出来，然后再筛选判断当前图书是否在预约的图书中，判断的时候都转化为字符串再比较
                  aggregate = Reserve.aggregate().match({
                    kind: 'BORROW',
                    $expr: {
                      $in: [{
                        $toString: obj._id
                      }, {
                        $map: {
                          input: '$bookIds',
                          as: 'bookId',
                          in: { $toString: '$$bookId' }
                        }
                      }]
                    }
                  }).unwind('$bookIds').group({
                    _id: '$bookIds',
                    count: { $sum: 1 }
                  });
                  _context.next = 4;
                  return aggregate.exec();

                case 4:
                  result = _context.sent;
                  _result = _slicedToArray(result, 1), first = _result[0];

                  resolve(first ? first.count : 0);
                  _context.next = 12;
                  break;

                case 9:
                  _context.prev = 9;
                  _context.t0 = _context['catch'](0);

                  reject(_context.t0);

                case 12:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this, [[0, 9]]);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  },
  BugReport: {
    id: function id(obj, args, context) {
      return obj._id;
    }
  },
  Category: {
    id: function id(obj, args, context) {
      return obj._id;
    },
    parent: function parent(obj, args, context) {
      var Category = context.db.model('Category');
      return Category.findById(obj.parent).lean().exec();
    }
  },
  Record: {
    id: function id(obj, args, context) {
      return obj._id;
    },
    book: function book(obj, args, context) {
      var Book = context.db.model('Book');
      return Book.findOne({ isbn: obj.isbn }).exec();
    },
    timeout: function timeout(obj, args, context) {
      return (obj.returnDate || Date.now()) > obj.deadline;
    },
    canDelay: function canDelay(obj, args, context) {
      var _this2 = this;

      return new Promise(function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
          var _ref3, user;

          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.prev = 0;
                  _context2.next = 3;
                  return context.client.query({
                    query: _constants.GetUserByIdQuery,
                    variables: { id: obj.userId }
                  });

                case 3:
                  _ref3 = _context2.sent;
                  user = _ref3.data.user;

                  resolve(obj.delayTimes < user.role.maxDelayTimes);
                  _context2.next = 11;
                  break;

                case 8:
                  _context2.prev = 8;
                  _context2.t0 = _context2['catch'](0);

                  reject(_context2.t0);

                case 11:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, _this2, [[0, 8]]);
        }));

        return function (_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }());
    }
  },
  BookComment: {
    id: function id(obj, args, context) {
      return obj._id;
    },
    thumbs: function thumbs(obj, args, context) {
      return obj.useful.length;
    }
  },
  Collection: {
    id: function id(obj, args, context) {
      return obj._id;
    },
    books: function books(obj, args, context) {
      var _this3 = this;

      var bookIds = obj.bookIds;
      return new Promise(function (resolve, reject) {
        try {
          var books = bookIds.map(function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(id) {
              var _ref5, book;

              return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      _context3.next = 2;
                      return context.client.query({
                        query: _constants.GetBookByIDQuery,
                        variables: { id: id }
                      });

                    case 2:
                      _ref5 = _context3.sent;
                      book = _ref5.data.book;
                      return _context3.abrupt('return', book);

                    case 5:
                    case 'end':
                      return _context3.stop();
                  }
                }
              }, _callee3, _this3);
            }));

            return function (_x5) {
              return _ref4.apply(this, arguments);
            };
          }());
          resolve(books);
        } catch (e) {
          reject(e);
        }
      });
    }
  },
  Post: {
    id: function id(obj, args, context, info) {
      return obj._id;
    },
    book: function book(obj, args, context) {
      if (obj.messageType === 'book') {
        var Book = context.db.model('Book');
        return Book.findById(obj.message).exec();
      } else {
        return null;
      }
    }
  },
  Feedback: {
    id: function id(obj, args, context, info) {
      return obj._id;
    }
  },
  ReadPlan: {
    id: function id(obj, args, context, info) {
      return obj._id;
    }
  },
  Plan: {
    book: function book(obj, args, context, info) {
      var Book = context.db.model('Book');
      return Book.findById(obj.bookId).exec();
    },
    process: function process(obj, args, context, info) {
      var _this4 = this;

      return new Promise(function () {
        var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(resolve, reject) {
          var Book, result, _timespan$map, _timespan$map2, start, end, total, process;

          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  Book = context.db.model('Book');
                  _context4.prev = 1;
                  _context4.next = 4;
                  return Book.aggregate().match({ _id: obj.bookId }).lookup({
                    from: 'records',
                    let: { isbn: '$isbn' },
                    pipeline: [{
                      $match: {
                        $expr: {
                          $and: [{
                            $eq: [{ $toString: obj.userId }, '$userId']
                          }, {
                            $eq: ['$$isbn', '$isbn']
                          }]
                        }
                      }
                    }, {
                      $project: { _id: 0, returnDate: 1 }
                    }],
                    as: 'record'
                  }).project({
                    _id: 0,
                    record: { $arrayElemAt: ['$record', 0] }
                  }).exec();

                case 4:
                  result = _context4.sent;

                  console.log(result);
                  if (result.length === 0) resolve(0);else if (result[0].reocrd.returnDate) resolve(100);else {
                    _timespan$map = timespan.map(function (date) {
                      return (0, _moment2.default)(date);
                    }), _timespan$map2 = _slicedToArray(_timespan$map, 2), start = _timespan$map2[0], end = _timespan$map2[1];
                    total = end.diff(start, 'days');
                    process = (0, _moment2.default)().diff(start, 'days');

                    if (process >= total) resolve(99); // 如果逾期未读完，返回完成进度为99
                    resolve(Math.round(process / total * 100));
                  }
                  _context4.next = 12;
                  break;

                case 9:
                  _context4.prev = 9;
                  _context4.t0 = _context4['catch'](1);

                  reject(_context4.t0);

                case 12:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, _this4, [[1, 9]]);
        }));

        return function (_x6, _x7) {
          return _ref6.apply(this, arguments);
        };
      }());
    }
  },
  Query: {
    books: function books(obj, args, context, info) {
      var Book = context.db.model('Book');
      return Book.find({}).skip(args.skip).limit(args.limit).lean().exec();
    },
    book: function book(obj, args, context, info) {
      var Book = context.db.model('Book');
      return Book.findById(args.id).lean().exec();
    },
    bookByISBN: function bookByISBN(obj, args, context, info) {
      var Book = context.db.model('Book');
      return Book.findOne({ isbn: args.isbn }).lean().exec();
    },
    bookByCoverID: function bookByCoverID(obj, _ref7, context, info) {
      var id = _ref7.id;

      var Book = context.db.model('Book');
      return Book.findOne({ cover: id }).lean().exec();
    },
    booksHaveCover: function booksHaveCover(obj, args, context, info) {
      var Book = context.db.model('Book');
      return Book.where('cover').ne(null).lean().exec();
    },
    booksWithoutCover: function booksWithoutCover(obj, _ref8, context, info) {
      var skip = _ref8.skip,
          limit = _ref8.limit;

      var Book = context.db.model('Book');
      return Book.find({ cover: null }).skip(skip).limit(limit).lean().exec();
    },
    booksFiltered: function booksFiltered(obj, _ref9, context, info) {
      var skip = _ref9.skip,
          limit = _ref9.limit,
          filter = _ref9.filter;

      var Book = context.db.model('Book');
      if (filter && filter.keyword) {
        return Book.find({ $text: { $search: filter.keyword } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).skip(skip).limit(limit).exec();
      }
      var query = Book.find({});
      if (filter && filter.category) query = query.regex('category', new RegExp('^' + filter.category));
      if (filter && filter.publisher) query = query.where('publisher', filter.publisher);
      if (filter && filter.count) query = query.gte('count', filter.count);
      if (filter && filter.authors) query = query.in('authors', filter.authors);
      if (filter && filter.sortBy) query = query.sort(_defineProperty({}, filter.sortBy, -1));
      return query.skip(skip).limit(limit).exec();
    },
    bookCount: function bookCount(obj, _ref10, context, info) {
      var filter = _ref10.filter;

      var Book = context.db.model('Book');
      var query = Book.find({});
      if (filter && filter.category) query = query.regex('category', new RegExp('^' + filter.category));
      if (filter && filter.publisher) query = query.where('publisher', filter.publisher);
      if (filter && filter.count) query = query.gte('count', filter.count);
      if (filter && filter.authors) query = query.in('authors', filter.authors);
      return query.count().exec();
    },
    selectOptions: function selectOptions(obj, args, context, info) {
      var Book = context.db.model('Book');
      var p1 = Book.distinct('authors').exec();
      var p2 = Book.distinct('translators').exec();
      var p3 = Book.distinct('publisher').exec();
      // Promise.all返回的结果是数组类型的，必须将其转化为对象类型再返回
      return Promise.all([p1, p2, p3]).then(function (_ref11) {
        var _ref12 = _slicedToArray(_ref11, 3),
            authors = _ref12[0],
            translators = _ref12[1],
            publishers = _ref12[2];

        return { authors: authors, translators: translators, publishers: publishers };
      });
    },
    publishers: function publishers(obj, _ref13, context) {
      var category = _ref13.category;

      var Book = context.db.model('Book');
      return Book.distinct('publisher', { category: category }).exec();
    },
    rootCategories: function rootCategories(obj, args, context, info) {
      var Category = context.db.model('Category');
      // null可以匹配不存在，查找没有parent属性的Category就是根节点
      return Category.find({ parent: null }).lean().exec();
    },
    childrenCategories: function childrenCategories(obj, _ref14, context, info) {
      var id = _ref14.id;

      var Category = context.db.model('Category');
      return Category.find({ parent: id }).lean().exec();
    },
    childrenByPath: function childrenByPath(obj, _ref15, context, info) {
      var path = _ref15.path;

      var _this5 = this;

      var Category = context.db.model('Category');
      return new Promise(function () {
        var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(resolve, reject) {
          var docs, children;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.prev = 0;
                  _context5.next = 3;
                  return Category.aggregate([{
                    $graphLookup: {
                      from: "categories",
                      startWith: "$parent",
                      connectFromField: "parent",
                      connectToField: "_id",
                      as: "result"
                    }
                  }, {
                    $project: {
                      path: {
                        $concat: [{
                          $reduce: {
                            input: "$result",
                            initialValue: '',
                            in: {
                              $concat: ["$$value", {
                                $cond: [{ $eq: ["$$value", ''] }, '', '/']
                              }, "$$this.label"]
                            }
                          }
                        }, {
                          $cond: [{
                            $eq: [{ $size: "$result" }, 0]
                          }, "", "/"]
                        }, "$label"]
                      }
                    }
                  }, {
                    $match: { path: path }
                  }]).exec();

                case 3:
                  docs = _context5.sent;

                  if (!docs || !docs.length) resolve([]);
                  _context5.next = 7;
                  return Category.find({ parent: docs[0]._id }).exec();

                case 7:
                  children = _context5.sent;

                  resolve(children);
                  _context5.next = 14;
                  break;

                case 11:
                  _context5.prev = 11;
                  _context5.t0 = _context5['catch'](0);

                  reject(_context5.t0);

                case 14:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, _this5, [[0, 11]]);
        }));

        return function (_x8, _x9) {
          return _ref16.apply(this, arguments);
        };
      }());
    },
    hasChildCategories: function hasChildCategories(obj, _ref17, context, info) {
      var id = _ref17.id;

      var Category = context.db.model('Category');
      return new Promise(function (resolve, reject) {
        Category.count({ parent: id }, function (err, count) {
          if (err) reject(err);else if (count > 0) resolve(true);else resolve(false);
        });
      });
    },
    categories: function categories(obj, args, context, info) {
      var Category = context.db.model('Category');
      return Category.find({}).lean().exec();
    },
    bugCovers: function bugCovers(obj, args, context, info) {
      var BugReport = context.db.model('BugReport');
      return BugReport.find({ keyword: 'COVER' }).nin('status', ['RESOLVED', 'REJECTED']).exec();
    },
    buggy: function buggy(obj, _ref18, context, info) {
      var id = _ref18.id;

      var BugReport = context.db.model('BugReport');
      return BugReport.find({}).or([{ bookId: id }, { coverId: id }]).findOne().exec();
    },
    outdatedRecords: function outdatedRecords(obj, args, context, info) {
      // 从给定起始日期往前推30天即为借书时间的下限
      var from = new Date(args.from.valueOf() - _settings.MAX_BORROW_DURATION);
      // 未提供to参数则从from参数往后推3天，即查询从from开始3天内到期的图书
      var to = args.to || new Date(args.from.valueOf() + _settings.DEFAULT_CHECK_DURATION);
      // 再从to的日期往前推30天得到借书时间的上限
      to = new Date(to.valueOf() - _settings.MAX_BORROW_DURATION);
      var Record = context.db.model('Record');
      return Record.find({ state: 'BORROWED' }).where('date').gte(from).lte(to).exec();
    },
    records: function records(obj, _ref19, context, info) {
      var skip = _ref19.skip,
          limit = _ref19.limit,
          filter = _ref19.filter;

      var _this6 = this;

      var Record = context.db.model('Record');
      var query = Record.find({});
      if (filter && filter.from) {
        query = query.gt('date', filter.from);
      }
      if (filter && filter.to) {
        query = query.lt('date', filter.to);
      }
      if (filter && filter.deadline) {
        var deadline = (0, _moment2.default)().add(filter.deadline, 'days').toDate();
        query = query.gt('deadline', Date.now()).lt('deadline', deadline);
      }
      if (filter && filter.state) {
        var state = filter.state === 'BORROWED' ? 'borrowed' : 'returned';
        query = query.where('state').equals(state);
      }
      return new Promise(function () {
        var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(resolve, reject) {
          var _ref21, data, _ref22, _data, records;

          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  if (!(filter && filter.username)) {
                    _context6.next = 14;
                    break;
                  }

                  _context6.prev = 1;
                  _context6.next = 4;
                  return context.client.query({
                    query: _constants.GetUserByNamequery,
                    variables: { username: filter.username }
                  });

                case 4:
                  _ref21 = _context6.sent;
                  data = _ref21.data;

                  query = query.where('userId').equals(data.userByName.id);
                  _context6.next = 12;
                  break;

                case 9:
                  _context6.prev = 9;
                  _context6.t0 = _context6['catch'](1);
                  reject(_context6.t0);

                case 12:
                  _context6.next = 23;
                  break;

                case 14:
                  if (!(filter && filter.userId)) {
                    _context6.next = 18;
                    break;
                  }

                  query = query.where('userId').equals(filter.userId);
                  _context6.next = 23;
                  break;

                case 18:
                  _context6.next = 20;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 20:
                  _ref22 = _context6.sent;
                  _data = _ref22.data;

                  if (_data.logedUser && _data.logedUser.role && !_data.logedUser.role.isAdmin) {
                    query = query.where('userId').equals(_data.logedUser.id);
                  }

                case 23:
                  _context6.prev = 23;
                  _context6.next = 26;
                  return query.sort('-lastModified').skip(skip).limit(limit).exec();

                case 26:
                  records = _context6.sent;

                  resolve(records);
                  _context6.next = 33;
                  break;

                case 30:
                  _context6.prev = 30;
                  _context6.t1 = _context6['catch'](23);
                  reject(_context6.t1);
                case 33:
                case 'end':
                  return _context6.stop();
              }
            }
          }, _callee6, _this6, [[1, 9], [23, 30]]);
        }));

        return function (_x10, _x11) {
          return _ref20.apply(this, arguments);
        };
      }());
    },
    userStatistics: function userStatistics(obj, _ref23, context, info) {
      var userId = _ref23.userId;

      var _this7 = this;

      var Record = context.db.model('Record');
      var Book = context.db.model('Book');
      return new Promise(function () {
        var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(resolve, reject) {
          var maxHoldBooksCount, _ref25, data;

          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  maxHoldBooksCount = _settings.MAX_HOLD_BOOKS_COUNT;
                  _context7.prev = 1;
                  _context7.next = 4;
                  return context.client.query({
                    query: _constants.GetUserByIdQuery,
                    variables: { id: userId }
                  });

                case 4:
                  _ref25 = _context7.sent;
                  data = _ref25.data;

                  maxHoldBooksCount = data.user.role.maxHoldCount;
                  _context7.next = 12;
                  break;

                case 9:
                  _context7.prev = 9;
                  _context7.t0 = _context7['catch'](1);

                  reject(_context7.t0);

                case 12:
                  Record.find({ userId: userId, state: { $ne: 'cancelled' } }).sort('-date').exec(function (err, result) {
                    if (err) reject(err);else if (result.length > 0) {
                      // res和result是一个读者的所有借书记录（含对同一本书的重复借阅）
                      var res = result.map(function (document) {
                        return document.toObject({ virtuals: true });
                      });
                      // 当前已借的图书
                      var borrowed = res.filter(function (doc) {
                        return doc.state === 'borrowed';
                      });
                      // 当前可借书的数量为最大可借书数减去已借书（尚未归还）的数
                      var maxHoldCount = maxHoldBooksCount - borrowed.length;
                      // 未逾期还书的次数
                      var num = res.filter(function (doc) {
                        return !doc.timeout;
                      }).length;
                      // 计算信用分数（应以所有借书次数和逾期次数为准），最高5分,保留1位小数
                      var credit = new Number(num / res.length * 5).toFixed(1);
                      // 相同的图书只保留最近一次的记录
                      var set = new Set(); // 利用Set不重复性来过滤重复图书
                      var docs = res.filter(function (doc) {
                        if (!set.has(doc.isbn)) {
                          set.add(doc.isbn);
                          return true;
                        } else {
                          return false;
                        }
                      });
                      // 读过的书的总数
                      var readCount = docs.length;
                      // 只取前5条记录
                      var recentRead = docs.slice(0, _settings.RECENT_READ_COUNT);
                      var isbns = docs.map(function (doc) {
                        return doc.isbn;
                      });
                      // 先根据isbn匹配图书,然后根据category分组并计数，此时返回结果格式为：{_id: '分类1',count: 10}
                      // 根据计数结果倒序排序，并只取前3个结果
                      Book.aggregate([{ $match: { isbn: { $in: isbns } } }]).group({ _id: '$category', count: { $sum: 1 } }).sort('-count').limit(_settings.INTEREST_CATEGORIES_COUNT).exec(function (err, res) {
                        if (err) reject(err);else {
                          var interests = res.map(function (doc) {
                            return doc._id;
                          }) || [];
                          resolve({ maxHoldCount: maxHoldCount, readCount: readCount, credit: credit, recentRead: recentRead, interests: interests });
                        }
                      });
                    } else {
                      resolve({ maxHoldCount: maxHoldBooksCount, readCount: 0, credit: 0, recentRead: [], interests: [] });
                    }
                  });

                case 13:
                case 'end':
                  return _context7.stop();
              }
            }
          }, _callee7, _this7, [[1, 9]]);
        }));

        return function (_x12, _x13) {
          return _ref24.apply(this, arguments);
        };
      }());
    },
    coversPage: function coversPage(obj, _ref26, context, info) {
      var page = _ref26.page,
          size = _ref26.size,
          filter = _ref26.filter;

      var _this8 = this;

      return new Promise(function () {
        var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(resolve, reject) {
          var _query, _ref28, booksHaveCover, _covers, _ref30, bugCovers, coversIDs, _ref32, covers;

          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  _context8.prev = 0;
                  _query = { tag: 'BOOK' };
                  _context8.t0 = filter;
                  _context8.next = _context8.t0 === 'SHOW_UNRELATED' ? 5 : _context8.t0 === 'SHOW_BUGS' ? 13 : 20;
                  break;

                case 5:
                  _context8.next = 7;
                  return context.client.query({
                    query: _constants.BooksHaveCoverQuery,
                    fetchPolicy: 'network-only'
                  });

                case 7:
                  _ref28 = _context8.sent;
                  booksHaveCover = _ref28.data.booksHaveCover;
                  _covers = booksHaveCover.map(function (_ref29) {
                    var cover = _ref29.cover;
                    return cover;
                  });

                  console.log(_covers.length);
                  _query['_id'] = { $nin: _covers };
                  return _context8.abrupt('break', 20);

                case 13:
                  _context8.next = 15;
                  return context.client.query({ query: _constants.BugCoversQuery, fetchPolicy: 'network-only' });

                case 15:
                  _ref30 = _context8.sent;
                  bugCovers = _ref30.data.bugCovers;
                  coversIDs = bugCovers.map(function (_ref31) {
                    var coverId = _ref31.coverId;
                    return coverId;
                  });

                  _query['_id'] = { '$in': coversIDs };
                  return _context8.abrupt('break', 20);

                case 20:
                  _query = JSON.stringify(_query);
                  _context8.next = 23;
                  return context.client.query({ query: _constants.CoversQuery, variables: { page: page, size: size, query: _query } });

                case 23:
                  _ref32 = _context8.sent;
                  covers = _ref32.data.covers;

                  resolve({ covers: covers, hasMore: covers.length === size });
                  _context8.next = 31;
                  break;

                case 28:
                  _context8.prev = 28;
                  _context8.t1 = _context8['catch'](0);

                  reject(_context8.t1);

                case 31:
                case 'end':
                  return _context8.stop();
              }
            }
          }, _callee8, _this8, [[0, 28]]);
        }));

        return function (_x14, _x15) {
          return _ref27.apply(this, arguments);
        };
      }());
    },
    coversCount: function coversCount(obj, args, context, info) {
      var _this9 = this;

      var count = function () {
        var _ref33 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(filter, size) {
          var _ref34, coversPage;

          return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  _context9.next = 2;
                  return context.client.query({ query: _constants.CoversPageQuery, variables: { filter: filter, size: size, page: 0 } });

                case 2:
                  _ref34 = _context9.sent;
                  coversPage = _ref34.data.coversPage;
                  return _context9.abrupt('return', coversPage.covers.length);

                case 5:
                case 'end':
                  return _context9.stop();
              }
            }
          }, _callee9, this);
        }));

        return function count(_x16, _x17) {
          return _ref33.apply(this, arguments);
        };
      }();

      return new Promise(function () {
        var _ref35 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(resolve, reject) {
          var _ref36, coversTotal, p1, p2, _ref37, _ref38, unrelatedCount, bugsCount;

          return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  _context10.prev = 0;
                  _context10.next = 3;
                  return context.client.query({ query: _constants.CoversTotalQuery, variables: { query: JSON.stringify({ tag: 'BOOK' }) } });

                case 3:
                  _ref36 = _context10.sent;
                  coversTotal = _ref36.data.coversTotal;
                  p1 = count('SHOW_UNRELATED', coversTotal);
                  p2 = count('SHOW_BUGS', coversTotal);
                  _context10.next = 9;
                  return Promise.all([p1, p2]);

                case 9:
                  _ref37 = _context10.sent;
                  _ref38 = _slicedToArray(_ref37, 2);
                  unrelatedCount = _ref38[0];
                  bugsCount = _ref38[1];

                  resolve({ unrelatedCount: unrelatedCount, bugsCount: bugsCount, total: coversTotal });
                  _context10.next = 19;
                  break;

                case 16:
                  _context10.prev = 16;
                  _context10.t0 = _context10['catch'](0);

                  reject(_context10.t0);

                case 19:
                case 'end':
                  return _context10.stop();
              }
            }
          }, _callee10, _this9, [[0, 16]]);
        }));

        return function (_x18, _x19) {
          return _ref35.apply(this, arguments);
        };
      }());
    },
    collection: function collection(obj, _ref39, context, info) {
      var userId = _ref39.userId,
          skip = _ref39.skip,
          limit = _ref39.limit;

      var _this10 = this;

      return new Promise(function () {
        var _ref40 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(resolve, reject) {
          var Collection, aggregate, result, books, end, sliced;
          return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
              switch (_context11.prev = _context11.next) {
                case 0:
                  _context11.prev = 0;
                  Collection = context.db.model('Collection');
                  aggregate = Collection.aggregate().match({ userId: userId }).unwind('books').lookup({
                    from: 'books',
                    let: { bookId: '$books.id' },
                    pipeline: [{
                      $match: {
                        $expr: {
                          $eq: [{ $toString: '$_id' }, '$$bookId']
                        }
                      }
                    }],
                    as: 'book'
                  });
                  // aggregate.exec(function (err, doc) {
                  //   console.log(doc)
                  // })

                  aggregate = aggregate.group({
                    _id: null,
                    collectedBooks: {
                      $push: { $mergeObjects: [{ $arrayElemAt: ['$book', 0] }, { iat: '$books.iat' }] }
                    }
                  });
                  _context11.next = 6;
                  return aggregate.exec();

                case 6:
                  result = _context11.sent;

                  if (!result[0]) resolve([]);else {
                    books = [].concat(_toConsumableArray(result[0].collectedBooks));
                    end = limit > 0 ? limit + skip : books.length;
                    sliced = books.sort(function (a, b) {
                      return a.iat < b.iat;
                    }).slice(skip, end);

                    resolve(sliced);
                  }
                  _context11.next = 13;
                  break;

                case 10:
                  _context11.prev = 10;
                  _context11.t0 = _context11['catch'](0);

                  reject(_context11.t0);

                case 13:
                case 'end':
                  return _context11.stop();
              }
            }
          }, _callee11, _this10, [[0, 10]]);
        }));

        return function (_x20, _x21) {
          return _ref40.apply(this, arguments);
        };
      }());

      if (typeof skip === 'number') query = query.skip(skip);
      if (typeof limit === 'number') query = query.limit(limit);
      return query.exec();
    },
    popularAuthors: function popularAuthors(obj, _ref41, context) {
      var _this11 = this;

      var category = _ref41.category;

      var Book = context.db.model('Book');
      return new Promise(function () {
        var _ref42 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(resolve, reject) {
          var authors;
          return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
              switch (_context12.prev = _context12.next) {
                case 0:
                  _context12.prev = 0;
                  _context12.next = 3;
                  return Book.aggregate().match({ category: category }).unwind('authors').group({ _id: '$authors', count: { $sum: 1 } }).sort('-count').limit(7).exec();

                case 3:
                  authors = _context12.sent;

                  // console.log(authors)
                  resolve(authors.map(function (_ref43) {
                    var _id = _ref43._id;
                    return _id;
                  }));
                  _context12.next = 10;
                  break;

                case 7:
                  _context12.prev = 7;
                  _context12.t0 = _context12['catch'](0);

                  reject(_context12.t0);

                case 10:
                case 'end':
                  return _context12.stop();
              }
            }
          }, _callee12, _this11, [[0, 7]]);
        }));

        return function (_x22, _x23) {
          return _ref42.apply(this, arguments);
        };
      }());
    },
    bookComment: function bookComment(obj, _ref44, context) {
      var id = _ref44.id;

      var BookComment = context.db.model('BookComment');
      return BookComment.findById(id).exec();
    },

    // 热门评论的计算方法：先根据认为评论有用的用户数倒序排列，再根据评论日期倒序排列
    bookComments: function bookComments(obj, _ref45, context) {
      var _this12 = this;

      var skip = _ref45.skip,
          limit = _ref45.limit,
          bookId = _ref45.bookId;

      var BookComment = context.db.model('BookComment');
      return new Promise(function () {
        var _ref46 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(resolve, reject) {
          var result;
          return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
              switch (_context13.prev = _context13.next) {
                case 0:
                  _context13.prev = 0;
                  _context13.next = 3;
                  return BookComment.aggregate([{
                    $match: { bookId: bookId }
                  }, {
                    $project: {
                      bookId: 1,
                      userId: 1,
                      details: 1,
                      title: 1,
                      score: 1,
                      postDate: 1,
                      useful: 1,
                      count: {
                        $size: "$useful"
                      }
                    }
                  }, {
                    $sort: { count: -1, postDate: -1 }
                  }]).skip(skip).limit(limit).exec();

                case 3:
                  result = _context13.sent;

                  // console.log(result)
                  resolve(result);
                  _context13.next = 10;
                  break;

                case 7:
                  _context13.prev = 7;
                  _context13.t0 = _context13['catch'](0);

                  reject(_context13.t0);

                case 10:
                case 'end':
                  return _context13.stop();
              }
            }
          }, _callee13, _this12, [[0, 7]]);
        }));

        return function (_x24, _x25) {
          return _ref46.apply(this, arguments);
        };
      }());
    },
    bookCommentsByUser: function bookCommentsByUser(obj, _ref47, context) {
      var skip = _ref47.skip,
          limit = _ref47.limit,
          userId = _ref47.userId;

      var BookComment = context.db.model('BookComment');
      return BookComment.find({ userId: userId }).sort('-postDate').skip(skip).limit(limit).exec();
    },
    bookCommentsProfile: function bookCommentsProfile(obj, _ref48, context) {
      var _this13 = this;

      var bookId = _ref48.bookId;

      var BookComment = context.db.model('BookComment');
      var aggregate = BookComment.aggregate();
      // 根据bookId匹配该书的所有评论
      aggregate = aggregate.match({ bookId: bookId });
      // 按评分分组，分组完之后的结果数组应该最多只有5个元素，分别对应1、2、3、4、5颗星，groupCount代表的是对应评分的人数
      aggregate = aggregate.group({
        _id: "$score",
        groupCount: { $sum: 1 }
      });
      // 按null分组可以计算总的评分人数，即把各组人数相加；最大评分，即分组键_id的最大值；总分值，即每个评分等级乘以对应的人数再求和，总分值是为了下一步求平均分做准备的，因为$divide和$multiply这些操作符
      // 不属于累加操作符，不能直接作为group下的根操作；最关键的，是将各评分等级和相应人数记录下来，即记到group数组中，以便于下一步的时候求各评分等级所占比重
      aggregate = aggregate.group({
        _id: null,
        max: { $max: "$_id" },
        count: { $sum: "$groupCount" },
        totalScore: { $sum: { $multiply: ["$groupCount", "$_id"] } },
        group: {
          $push: {
            level: "$_id",
            groupCount: "$groupCount"
          }
        }
      });
      // 在上一步的基础上，进行映射project操作：_id字段就不要了；max和count字段直接保留就行；增加average字段，用上一步算好的总分值除以总人数即可；group字段要使用$map操作符进行映射，对于每一个group对象,
      // level字段直接原样输出，percent字段拿groupCount除以总count即得出所占比例
      aggregate = aggregate.project({
        _id: 0,
        max: 1,
        count: 1,
        group: {
          $map: {
            input: "$group",
            as: "group",
            in: {
              level: "$$group.level",
              percent: {
                $divide: ["$$group.groupCount", "$count"]
              }
            }
          }
        },
        average: { $divide: ["$totalScore", "$count"] }
      });
      return new Promise(function () {
        var _ref49 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(resolve, reject) {
          var res;
          return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  _context14.prev = 0;
                  _context14.next = 3;
                  return aggregate.exec();

                case 3:
                  res = _context14.sent;

                  // 最后要记住，aggregate返回的结果一直都是数组，即使只有1个元素，所以直接返回数组第一个元素即可
                  resolve(res[0]);
                  _context14.next = 10;
                  break;

                case 7:
                  _context14.prev = 7;
                  _context14.t0 = _context14['catch'](0);

                  reject(_context14.t0);

                case 10:
                case 'end':
                  return _context14.stop();
              }
            }
          }, _callee14, _this13, [[0, 7]]);
        }));

        return function (_x26, _x27) {
          return _ref49.apply(this, arguments);
        };
      }());
    },
    hasThumbed: function hasThumbed(obj, _ref50, context) {
      var id = _ref50.id,
          userId = _ref50.userId;

      var BookComment = context.db.model('BookComment');
      return BookComment.findById(id).in('useful', userId).exec();
    },
    hasUserCommented: function hasUserCommented(obj, _ref51, context) {
      var _this14 = this;

      var userId = _ref51.userId,
          bookId = _ref51.bookId;

      var BookComment = context.db.model('BookComment');
      return new Promise(function () {
        var _ref52 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(resolve, reject) {
          var comment;
          return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
              switch (_context15.prev = _context15.next) {
                case 0:
                  _context15.prev = 0;
                  _context15.next = 3;
                  return BookComment.findOne({ userId: userId, bookId: bookId }).exec();

                case 3:
                  comment = _context15.sent;

                  resolve(!!comment);
                  _context15.next = 10;
                  break;

                case 7:
                  _context15.prev = 7;
                  _context15.t0 = _context15['catch'](0);

                  reject(_context15.t0);

                case 10:
                case 'end':
                  return _context15.stop();
              }
            }
          }, _callee15, _this14, [[0, 7]]);
        }));

        return function (_x28, _x29) {
          return _ref52.apply(this, arguments);
        };
      }());
    },
    cartCount: function cartCount(obj, args, context) {
      var _this15 = this;

      return new Promise(function () {
        var _ref53 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(resolve, reject) {
          var _ref54, data, Cart, cart;

          return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  _context16.prev = 0;
                  _context16.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref54 = _context16.sent;
                  data = _ref54.data;

                  if (data.logedUser) {
                    _context16.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  Cart = context.db.model('Cart');
                  _context16.next = 10;
                  return Cart.findOne({ userId: data.logedUser.id }).exec();

                case 10:
                  cart = _context16.sent;

                  if (cart) {
                    resolve(cart.get('bookIds').length);
                  }
                  resolve(0);
                  _context16.next = 18;
                  break;

                case 15:
                  _context16.prev = 15;
                  _context16.t0 = _context16['catch'](0);

                  reject(_context16.t0);

                case 18:
                case 'end':
                  return _context16.stop();
              }
            }
          }, _callee16, _this15, [[0, 15]]);
        }));

        return function (_x30, _x31) {
          return _ref53.apply(this, arguments);
        };
      }());
    },
    booksInCart: function booksInCart(obj, args, context) {
      var _this16 = this;

      var Cart = context.db.model('Cart');
      var Book = context.db.model('Book');
      return new Promise(function () {
        var _ref55 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(resolve, reject) {
          var _ref56, data, result, _result2, first;

          return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
              switch (_context17.prev = _context17.next) {
                case 0:
                  _context17.prev = 0;
                  _context17.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref56 = _context17.sent;
                  data = _ref56.data;

                  if (data.logedUser) {
                    _context17.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  _context17.next = 9;
                  return Cart.aggregate().match({ userId: data.logedUser.id }).unwind('bookIds').lookup({
                    from: 'books',
                    localField: 'bookIds',
                    foreignField: '_id',
                    as: 'book'
                  }).group({
                    _id: null,
                    books: {
                      $push: {
                        $arrayElemAt: ['$book', 0]
                      }
                    }
                  });

                case 9:
                  result = _context17.sent;
                  _result2 = _slicedToArray(result, 1), first = _result2[0];

                  resolve(first ? first.books : []);
                  _context17.next = 17;
                  break;

                case 14:
                  _context17.prev = 14;
                  _context17.t0 = _context17['catch'](0);

                  reject(_context17.t0);

                case 17:
                case 'end':
                  return _context17.stop();
              }
            }
          }, _callee17, _this16, [[0, 14]]);
        }));

        return function (_x32, _x33) {
          return _ref55.apply(this, arguments);
        };
      }());
    },
    subsInCart: function subsInCart(obj, args, context) {
      var _this17 = this;

      return new Promise(function () {
        var _ref57 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(resolve, reject) {
          var _ref58, data, Cart, result;

          return regeneratorRuntime.wrap(function _callee18$(_context18) {
            while (1) {
              switch (_context18.prev = _context18.next) {
                case 0:
                  _context18.prev = 0;
                  _context18.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref58 = _context18.sent;
                  data = _ref58.data;

                  if (data.logedUser) {
                    _context18.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  Cart = context.db.model('Cart');
                  _context18.next = 10;
                  return Cart.aggregate().match({ userId: data.logedUser.id }).unwind('subscriptions').lookup({
                    from: 'books',
                    localField: 'subscriptions',
                    foreignField: 'isbn',
                    as: 'book'
                  }).group({
                    _id: null,
                    books: {
                      $push: {
                        $arrayElemAt: ['$book', 0]
                      }
                    }
                  }).exec();

                case 10:
                  result = _context18.sent;

                  if (result[0]) resolve(result[0].books);else resolve([]);
                  _context18.next = 17;
                  break;

                case 14:
                  _context18.prev = 14;
                  _context18.t0 = _context18['catch'](0);

                  reject(_context18.t0);

                case 17:
                case 'end':
                  return _context18.stop();
              }
            }
          }, _callee18, _this17, [[0, 14]]);
        }));

        return function (_x34, _x35) {
          return _ref57.apply(this, arguments);
        };
      }());
    },
    booksInPlan: function booksInPlan(obj, _ref59, context) {
      var _this18 = this;

      var userId = _ref59.userId,
          kind = _ref59.kind;

      return new Promise(function () {
        var _ref60 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(resolve, reject) {
          var id, _ref61, data, Reserve, results;

          return regeneratorRuntime.wrap(function _callee19$(_context19) {
            while (1) {
              switch (_context19.prev = _context19.next) {
                case 0:
                  _context19.prev = 0;
                  id = userId;

                  if (id) {
                    _context19.next = 8;
                    break;
                  }

                  _context19.next = 5;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 5:
                  _ref61 = _context19.sent;
                  data = _ref61.data;

                  id = data.logedUser.id;

                case 8:
                  Reserve = context.db.model('Reserve');
                  _context19.next = 11;
                  return Reserve.aggregate().match({ userId: id, kind: kind }).unwind('bookIds').lookup({
                    from: 'books',
                    localField: 'bookIds',
                    foreignField: '_id',
                    as: 'book'
                  }).group({
                    _id: null,
                    expireAt: {
                      $push: "$expireAt"
                    },
                    books: {
                      $push: {
                        $arrayElemAt: ['$book', 0]
                      }
                    }
                  }).project({
                    _id: 0,
                    books: 1,
                    expireAt: { $arrayElemAt: ['$expireAt', 0] }
                  });

                case 11:
                  results = _context19.sent;

                  resolve(results[0]);
                  _context19.next = 18;
                  break;

                case 15:
                  _context19.prev = 15;
                  _context19.t0 = _context19['catch'](0);

                  reject(_context19.t0);

                case 18:
                case 'end':
                  return _context19.stop();
              }
            }
          }, _callee19, _this18, [[0, 15]]);
        }));

        return function (_x36, _x37) {
          return _ref60.apply(this, arguments);
        };
      }());
    },
    getSession: function getSession(obj, _ref62, context) {
      var _this19 = this;

      var participators = _ref62.participators;

      return new Promise(function () {
        var _ref63 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(resolve, reject) {
          var _ref64, data, queries, len, Conversation, result, item, conversation;

          return regeneratorRuntime.wrap(function _callee20$(_context20) {
            while (1) {
              switch (_context20.prev = _context20.next) {
                case 0:
                  _context20.prev = 0;
                  _context20.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref64 = _context20.sent;
                  data = _ref64.data;

                  if (data.logedUser) {
                    _context20.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  queries = participators.map(function (userId) {
                    return { participators: userId };
                  });

                  queries.push({ participators: data.logedUser.id });
                  len = queries.length;
                  Conversation = context.db.model('Conversation');
                  _context20.next = 13;
                  return Conversation.aggregate().match({ $and: queries }).project({
                    _id: 0,
                    id: {
                      $cond: [{
                        $eq: [{ $size: '$participators' }, len]
                      }, '$_id', null]
                    }
                  }).exec();

                case 13:
                  result = _context20.sent;

                  // console.log(result)
                  item = result.filter(function (_ref65) {
                    var id = _ref65.id;
                    return !!id;
                  })[0];

                  if (!item) {
                    _context20.next = 19;
                    break;
                  }

                  resolve(item.id);
                  _context20.next = 23;
                  break;

                case 19:
                  _context20.next = 21;
                  return new Conversation({ participators: [].concat(_toConsumableArray(participators), [data.logedUser.id]) }).save();

                case 21:
                  conversation = _context20.sent;

                  resolve(conversation.id);

                case 23:
                  _context20.next = 28;
                  break;

                case 25:
                  _context20.prev = 25;
                  _context20.t0 = _context20['catch'](0);

                  reject(_context20.t0);

                case 28:
                case 'end':
                  return _context20.stop();
              }
            }
          }, _callee20, _this19, [[0, 25]]);
        }));

        return function (_x38, _x39) {
          return _ref63.apply(this, arguments);
        };
      }());
    },
    posts: function posts(obj, _ref66, context) {
      var _this20 = this;

      var sessionId = _ref66.sessionId,
          skip = _ref66.skip,
          limit = _ref66.limit;

      return new Promise(function () {
        var _ref67 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(resolve, reject) {
          var Post, aggregate, posts, result;
          return regeneratorRuntime.wrap(function _callee21$(_context21) {
            while (1) {
              switch (_context21.prev = _context21.next) {
                case 0:
                  _context21.prev = 0;
                  Post = context.db.model('Post');
                  // 按日期降序排列，筛选limit条记录，按照年、月、日、小时、分钟相同的进行分组，即每分钟的信息编成1组

                  aggregate = Post.aggregate().match({ sessionId: sessionId }).sort('-iat').skip(skip).limit(limit).group({
                    _id: {
                      year: { $toString: { $year: { date: '$iat' } } }, // 四位年份（字符串）
                      month: { $dateToString: { date: '$iat', format: '%m' } }, // 2位月份，前面补0（字符串）
                      day: { $dateToString: { date: '$iat', format: '%d' } }, // 2位日期，前面补0（字符串）
                      hour: { $dateToString: { date: '$iat', format: '%H' } }, // 2位小时，前面补0，（字符串）
                      minute: { $dateToString: { date: '$iat', format: '%M' } // 2位分钟，前面补0，（字符串）
                      } },
                    posts: {
                      $push: {
                        _id: '$_id',
                        postBy: '$postBy',
                        message: '$message',
                        messageType: '$messageType',
                        status: '$status',
                        iat: '$iat',
                        sessionId: '$sessionId'
                      }
                    }
                  });
                  // 把group的_id重新还原位日期格式，便于后面使用moment进行格式化

                  aggregate = aggregate.project({
                    _id: 0,
                    posts: 1,
                    issueAt: {
                      $dateFromString: {
                        dateString: {
                          $concat: ['$_id.year', '-', '$_id.month', '-', '$_id.day', 'T', '$_id.hour', ':', '$_id.minute', ':00.000Z']
                        }
                      }
                    }
                  }).sort('issueAt');
                  _context21.next = 6;
                  return aggregate.exec();

                case 6:
                  posts = _context21.sent;
                  result = posts.map(function (_ref68) {
                    var posts = _ref68.posts,
                        issueAt = _ref68.issueAt;

                    posts.sort(function (a, b) {
                      return a.iat > b.iat;
                    });
                    return { posts: posts, iat: (0, _utils.fmtPostDate)(issueAt) };
                  });

                  resolve(result);
                  _context21.next = 14;
                  break;

                case 11:
                  _context21.prev = 11;
                  _context21.t0 = _context21['catch'](0);

                  reject(_context21.t0);

                case 14:
                case 'end':
                  return _context21.stop();
              }
            }
          }, _callee21, _this20, [[0, 11]]);
        }));

        return function (_x40, _x41) {
          return _ref67.apply(this, arguments);
        };
      }());
    },
    feedbacks: function feedbacks(obj, args, context) {
      var _this21 = this;

      var Feedback = context.db.model('Feedback');
      return new Promise(function () {
        var _ref69 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(resolve, reject) {
          var _ref70, data, query, category;

          return regeneratorRuntime.wrap(function _callee22$(_context22) {
            while (1) {
              switch (_context22.prev = _context22.next) {
                case 0:
                  _context22.next = 2;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 2:
                  _ref70 = _context22.sent;
                  data = _ref70.data;

                  if (data.logedUser) {
                    _context22.next = 6;
                    break;
                  }

                  throw new Error('用户未登录');

                case 6:
                  if (data.logedUser.role.isAdmin) {
                    _context22.next = 8;
                    break;
                  }

                  throw new Error('没有权限查看');

                case 8:
                  query = Feedback.find({});
                  category = args.category;

                  if (category) query = query.find({ category: category });
                  _context22.prev = 11;
                  _context22.t0 = resolve;
                  _context22.next = 15;
                  return query.exec();

                case 15:
                  _context22.t1 = _context22.sent;
                  (0, _context22.t0)(_context22.t1);
                  _context22.next = 22;
                  break;

                case 19:
                  _context22.prev = 19;
                  _context22.t2 = _context22['catch'](11);

                  reject(_context22.t2);

                case 22:
                case 'end':
                  return _context22.stop();
              }
            }
          }, _callee22, _this21, [[11, 19]]);
        }));

        return function (_x42, _x43) {
          return _ref69.apply(this, arguments);
        };
      }());
    },
    readPlans: function readPlans(obj, args, context) {
      var _this22 = this;

      return new Promise(function () {
        var _ref71 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(resolve, reject) {
          var _ref72, data, ReadPlan, readPlans;

          return regeneratorRuntime.wrap(function _callee23$(_context23) {
            while (1) {
              switch (_context23.prev = _context23.next) {
                case 0:
                  _context23.prev = 0;
                  _context23.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref72 = _context23.sent;
                  data = _ref72.data;

                  if (data.logedUser) {
                    _context23.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  ReadPlan = context.db.model('ReadPlan');
                  _context23.next = 10;
                  return ReadPlan.find({ userId: data.logedUser.id }).sort('-createAt').exec();

                case 10:
                  readPlans = _context23.sent;

                  resolve(readPlans);
                  _context23.next = 17;
                  break;

                case 14:
                  _context23.prev = 14;
                  _context23.t0 = _context23['catch'](0);

                  reject(_context23.t0);

                case 17:
                case 'end':
                  return _context23.stop();
              }
            }
          }, _callee23, _this22, [[0, 14]]);
        }));

        return function (_x44, _x45) {
          return _ref71.apply(this, arguments);
        };
      }());
    },
    interests: function interests(obj, args, context) {
      var _this23 = this;

      return new Promise(function () {
        var _ref73 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(resolve, reject) {
          var _ref74, data, Record, result, total, props;

          return regeneratorRuntime.wrap(function _callee24$(_context24) {
            while (1) {
              switch (_context24.prev = _context24.next) {
                case 0:
                  _context24.prev = 0;
                  _context24.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref74 = _context24.sent;
                  data = _ref74.data;

                  if (!data.logedUser) resolve(null);
                  Record = context.db.model('Record');
                  _context24.next = 9;
                  return Record.aggregate().match({ userId: data.logedUser.id, state: { $ne: 'cancelled' } }).lookup({
                    from: 'books',
                    localField: 'isbn',
                    foreignField: 'isbn',
                    as: 'book'
                  }).project({
                    _id: 0,
                    category: { $arrayElemAt: ['$book.category', 0] }
                  }).group({
                    _id: '$category',
                    count: { $sum: 1 }
                  }).sort('-count').project({
                    category: '$_id',
                    count: 1
                  }).exec();

                case 9:
                  result = _context24.sent;
                  total = result.reduce(function (memo, _ref75) {
                    var count = _ref75.count;

                    memo = memo + count;
                    return memo;
                  }, 0);

                  result = result.map(function (_ref76) {
                    var category = _ref76.category,
                        count = _ref76.count;
                    return { count: count, category: category.split('/').pop(), percent: Number(Number(count / total * 100).toFixed(2)) };
                  });
                  console.log(result);
                  if (result.length > 5) {
                    result = result.slice(0, 5);
                    props = result.slice(5).reduce(function (memo, _ref77) {
                      var count = _ref77.count,
                          percent = _ref77.percent;

                      memo.percent = memo.percent + percent;
                      memo.count = memo.count + count;
                      return memo;
                    }, { percent: 0, count: 0 });

                    result.push(_extends({}, props, { category: '其它' }));
                  }
                  resolve(result);
                  _context24.next = 20;
                  break;

                case 17:
                  _context24.prev = 17;
                  _context24.t0 = _context24['catch'](0);

                  reject(_context24.t0);

                case 20:
                case 'end':
                  return _context24.stop();
              }
            }
          }, _callee24, _this23, [[0, 17]]);
        }));

        return function (_x46, _x47) {
          return _ref73.apply(this, arguments);
        };
      }());
    },
    mostBorrowed: function mostBorrowed(obj, _ref78, context) {
      var _this24 = this;

      var skip = _ref78.skip,
          limit = _ref78.limit;

      var Record = context.db.model('Record');
      return new Promise(function () {
        var _ref79 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(resolve, reject) {
          var result;
          return regeneratorRuntime.wrap(function _callee25$(_context25) {
            while (1) {
              switch (_context25.prev = _context25.next) {
                case 0:
                  _context25.prev = 0;
                  _context25.next = 3;
                  return Record.aggregate().group({
                    _id: '$isbn',
                    count: { $sum: 1 }
                  }).sort('-count').skip(skip).limit(limit).lookup({
                    from: 'books',
                    localField: '_id',
                    foreignField: 'isbn',
                    as: 'book'
                  }).project({
                    _id: 0,
                    count: 1,
                    book: { $arrayElemAt: ['$book', 0] }
                  }).exec();

                case 3:
                  result = _context25.sent;

                  console.log(result);
                  resolve(result);
                  _context25.next = 11;
                  break;

                case 8:
                  _context25.prev = 8;
                  _context25.t0 = _context25['catch'](0);

                  reject(_context25.t0);

                case 11:
                case 'end':
                  return _context25.stop();
              }
            }
          }, _callee25, _this24, [[0, 8]]);
        }));

        return function (_x48, _x49) {
          return _ref79.apply(this, arguments);
        };
      }());
    },
    mostCollected: function mostCollected(obj, _ref80, context) {
      var _this25 = this;

      var skip = _ref80.skip,
          limit = _ref80.limit;

      var Collection = context.db.model('Collection');
      return new Promise(function () {
        var _ref81 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(resolve, reject) {
          var result;
          return regeneratorRuntime.wrap(function _callee26$(_context26) {
            while (1) {
              switch (_context26.prev = _context26.next) {
                case 0:
                  _context26.prev = 0;
                  _context26.next = 3;
                  return Collection.aggregate().unwind('books').group({
                    _id: '$books.id',
                    count: { $sum: 1 }
                  }).sort('-count').skip(skip).limit(limit).lookup({
                    from: 'books',
                    let: { bookId: '$_id' },
                    pipeline: [{
                      $match: {
                        $expr: {
                          $eq: ['$$bookId', { $toString: '$_id' }]
                        }
                      }
                    }],
                    as: 'book'
                  }).project({
                    _id: 0,
                    count: 1,
                    book: { $arrayElemAt: ['$book', 0] }
                  }).exec();

                case 3:
                  result = _context26.sent;

                  console.log(result);
                  resolve(result);
                  _context26.next = 11;
                  break;

                case 8:
                  _context26.prev = 8;
                  _context26.t0 = _context26['catch'](0);

                  reject(_context26.t0);

                case 11:
                case 'end':
                  return _context26.stop();
              }
            }
          }, _callee26, _this25, [[0, 8]]);
        }));

        return function (_x50, _x51) {
          return _ref81.apply(this, arguments);
        };
      }());
    },
    mostRecommanded: function mostRecommanded(obj, _ref82, context) {
      var _this26 = this;

      var skip = _ref82.skip,
          limit = _ref82.limit;

      return new Promise(function () {
        var _ref83 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(resolve, reject) {
          var Post, result;
          return regeneratorRuntime.wrap(function _callee27$(_context27) {
            while (1) {
              switch (_context27.prev = _context27.next) {
                case 0:
                  Post = context.db.model('Post');
                  _context27.prev = 1;
                  _context27.next = 4;
                  return Post.aggregate().match({
                    messageType: 'book'
                  }).group({
                    _id: '$message',
                    count: { $sum: 1 }
                  }).sort('-count').skip(skip).limit(limit).lookup({
                    from: 'books',
                    let: { bookId: '$_id' },
                    pipeline: [{
                      $match: {
                        $expr: {
                          $eq: ['$$bookId', { $toString: '$_id' }]
                        }
                      }
                    }],
                    as: 'book'
                  }).project({
                    _id: 0,
                    count: 1,
                    book: { $arrayElemAt: ['$book', 0] }
                  }).exec();

                case 4:
                  result = _context27.sent;

                  console.log(result);
                  resolve(result);
                  _context27.next = 12;
                  break;

                case 9:
                  _context27.prev = 9;
                  _context27.t0 = _context27['catch'](1);

                  reject(_context27.t0);

                case 12:
                case 'end':
                  return _context27.stop();
              }
            }
          }, _callee27, _this26, [[1, 9]]);
        }));

        return function (_x52, _x53) {
          return _ref83.apply(this, arguments);
        };
      }());
    }
  },
  Mutation: {
    batchAddBooks: function batchAddBooks(obj, _ref84, context, info) {
      var books = _ref84.books;

      var Book = context.db.model('Book');
      return new Promise(function (resolve, reject) {
        // 查询所有图书的isbn，isbn已经存在的不再写入数据库，避免duplicated key error
        Book.find({}, { lean: true, select: 'isbn' }, function (err, docs) {
          if (err) reject(err);
          var isbns = docs.map(function (doc) {
            return doc.isbn;
          });
          var filteredBooks = books.filter(function (book) {
            return isbns.indexOf(book.isbn) === -1;
          });
          Book.insertMany(filteredBooks, { ordered: false }, function (error, docs) {
            if (error) reject(error);
            resolve(docs);
          });
        });
      });
    },
    addBook: function addBook(obj, args, context, info) {
      var Book = context.db.model('Book');
      var book = new Book(args.book);
      return new Promise(function (resolve, reject) {
        book.save({ lean: true }, function (err, bookAdded) {
          if (err) reject(err);else {
            resolve(bookAdded);
          }
        });
      });
    },
    updateBookByID: function updateBookByID(obj, args, context, info) {
      var Book = context.db.model('Book');
      var id = args.id,
          book = args.book;

      return new Promise(function (resolve, reject) {
        Book.findById(id).exec(function (err, doc) {
          if (err) reject(err);else {
            // 如果更新了cover的话，要将原来cover对应的图片文件从数据库中删除，以避免产生垃圾
            if (book.cover && doc.get('cover')) {
              var p1 = context.client.mutate({
                mutation: (0, _graphqlTag2.default)(_templateObject),
                variables: { id: doc.get('cover') }
              });
              doc.set(book);
              var p2 = doc.save();
              Promise.all([p1, p2]).then(function (_ref85) {
                var _ref86 = _slicedToArray(_ref85, 2),
                    id = _ref86[0],
                    book = _ref86[1];

                return resolve(book);
              }).catch(function (err) {
                return reject(err);
              });
            } else {
              doc.set(book);
              doc.save().then(function (book) {
                return resolve(book);
              }).catch(function (err) {
                return reject(err);
              });
            }
          }
        });
      });
    },
    batchUpdateBookCover: function batchUpdateBookCover(obj, _ref87, context, info) {
      var maps = _ref87.maps;

      var Book = context.db.model('Book');
      var bulkWriteOperations = maps.map(function (_ref88) {
        var bookId = _ref88.bookId,
            coverId = _ref88.coverId;
        return {
          updateOne: {
            filter: { '_id': bookId },
            update: { 'cover': coverId }
          }
        };
      });
      return new Promise(function (resolve, reject) {
        Book.bulkWrite(bulkWriteOperations, { ordered: false }, function (err, bulkOpResult) {
          if (err) reject(err);else {
            resolve(true);
          }
        });
      });
    },
    delBookById: function delBookById(obj, _ref89, context, info) {
      var id = _ref89.id;

      var Book = context.db.model('Book');
      return new Promise(function (resolve, reject) {
        Book.findByIdAndRemove(id, { lean: true }, function (err, bookDeleted) {
          if (err) reject(err);else {
            context.client.mutate({
              mutation: _constants.DeleteCoverMutation,
              variables: { id: bookDeleted.cover }
            }).then(function (data) {
              resolve(bookDeleted);
            }).catch(function (err) {
              return reject(err);
            });
          }
        });
      });
    },
    addCategory: function addCategory(obj, args, context, info) {
      var Category = context.db.model('Category');
      var category = new Category(args);
      return new Promise(function (resolve, reject) {
        category.save({ lean: true }, function (err, categoryAdded) {
          if (err) reject(err);else {
            resolve(categoryAdded);
          }
        });
      });
    },
    updateCategory: function updateCategory(obj, args, context, info) {
      var Category = context.db.model('Category');

      var id = args.id,
          update = _objectWithoutProperties(args, ['id']);

      return Category.findByIdAndUpdate(id, update, { new: true }).lean().exec();
    },

    // 删除分类时，同步将所有子类一起删除
    removeCategory: function removeCategory(obj, _ref90, context, info) {
      var id = _ref90.id;

      var Category = context.db.model('Category');
      return new Promise(function (resolve, reject) {
        Category.find({}, 'parent', { lean: true }, function (err, categories) {
          if (err) reject(err);
          var delIDs = getChildren(categories, id).concat(id);
          console.log(delIDs);
          Category.deleteMany({ "_id": { "$in": delIDs } }, function (err) {
            if (err) reject(err);else {
              resolve(true);
            }
          });
        });
      });
    },
    addBugReport: function addBugReport(obj, _ref91, context, info) {
      var bugReport = _ref91.bugReport;

      var BugReport = context.db.model('BugReport');
      return new BugReport(bugReport).save();
    },
    updateBugStatus: function updateBugStatus(obj, _ref92, context, info) {
      var id = _ref92.id,
          status = _ref92.status;

      var BugReport = context.db.model('BugReport');
      return BugReport.findByIdAndUpdate(id, { status: status }, { new: true }).exec();
    },


    //如果出现数据一致性问题，比如一本书数量减少了1本，但是在更新state为applied时发生了错误，由定时器进行检查并回滚
    borrowBooks: function borrowBooks(obj, _ref93, context, info) {
      var userId = _ref93.userId,
          isbns = _ref93.isbns;

      var Record = context.db.model('Record');
      var promise = context.client.query({ query: _constants.GetUserByIdQuery, variables: { id: userId } });
      return promise.then(function (_ref94) {
        var user = _ref94.data.user;

        var deadline = (0, _moment2.default)().add(user.role.maxBorrowDuration, 'days').toDate();
        var records = isbns.map(function (isbn) {
          return {
            userId: userId,
            isbn: isbn,
            deadline: deadline,
            state: 'initial'
          };
        });
        var defer = Record.insertMany(records, { ordered: false });
        return defer.then(function () {
          var promises = isbns.map(function (isbn) {
            return _transactions2.default.Books.startTransaction(context, isbn, 'initial', userId);
          });
          return Promise.all(promises);
        });
      });
    },
    returnBooks: function returnBooks(obj, _ref95, context, info) {
      var userId = _ref95.userId,
          isbns = _ref95.isbns;

      var _this27 = this;

      var promises = isbns.map(function (isbn) {
        return _transactions2.default.Books.startTransaction(context, isbn, 'borrowed', userId);
      });
      return new Promise(function () {
        var _ref96 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(resolve, reject) {
          var result, Cart;
          return regeneratorRuntime.wrap(function _callee28$(_context28) {
            while (1) {
              switch (_context28.prev = _context28.next) {
                case 0:
                  _context28.prev = 0;
                  _context28.next = 3;
                  return Promise.all(promises);

                case 3:
                  result = _context28.sent;
                  Cart = context.db.model('Cart');

                  resolve(result);
                  _context28.next = 11;
                  break;

                case 8:
                  _context28.prev = 8;
                  _context28.t0 = _context28['catch'](0);

                  reject(_context28.t0);

                case 11:
                case 'end':
                  return _context28.stop();
              }
            }
          }, _callee28, _this27, [[0, 8]]);
        }));

        return function (_x54, _x55) {
          return _ref96.apply(this, arguments);
        };
      }());
    },
    delayReturn: function delayReturn(obj, _ref97, context, info) {
      var recordId = _ref97.recordId;

      var _this28 = this;

      var Record = context.db.model('Record');
      return new Promise(function () {
        var _ref98 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(resolve, reject) {
          var record, _ref99, user;

          return regeneratorRuntime.wrap(function _callee29$(_context29) {
            while (1) {
              switch (_context29.prev = _context29.next) {
                case 0:
                  _context29.prev = 0;
                  _context29.next = 3;
                  return Record.findById(recordId).exec();

                case 3:
                  record = _context29.sent;
                  _context29.next = 6;
                  return context.client.query({ query: _constants.GetUserByIdQuery, variables: { id: record.userId } });

                case 6:
                  _ref99 = _context29.sent;
                  user = _ref99.data.user;

                  if (!(record.delayTimes < user.role.maxDelayTimes)) {
                    _context29.next = 16;
                    break;
                  }

                  record.delayTimes = record.delayTimes + 1;
                  record.deadline = (0, _moment2.default)(record.deadline).add(user.role.maxDelayDays, 'days');
                  _context29.next = 13;
                  return record.save();

                case 13:
                  resolve(true);
                  _context29.next = 17;
                  break;

                case 16:
                  reject(new Error('已经达到最大续借过次数'));

                case 17:
                  _context29.next = 22;
                  break;

                case 19:
                  _context29.prev = 19;
                  _context29.t0 = _context29['catch'](0);

                  reject(_context29.t0);

                case 22:
                case 'end':
                  return _context29.stop();
              }
            }
          }, _callee29, _this28, [[0, 19]]);
        }));

        return function (_x56, _x57) {
          return _ref98.apply(this, arguments);
        };
      }());
    },
    delUnrelatedCovers: function delUnrelatedCovers(obj, args, context, info) {
      var _this29 = this;

      return new Promise(function () {
        var _ref100 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(resolve, reject) {
          var _ref101, booksHaveCover, covers, _query2;

          return regeneratorRuntime.wrap(function _callee30$(_context30) {
            while (1) {
              switch (_context30.prev = _context30.next) {
                case 0:
                  _context30.prev = 0;
                  _context30.next = 3;
                  return context.client.query({ query: _constants.BooksHaveCoverQuery });

                case 3:
                  _ref101 = _context30.sent;
                  booksHaveCover = _ref101.data.booksHaveCover;
                  covers = booksHaveCover.map(function (_ref102) {
                    var cover = _ref102.cover;
                    return cover;
                  });
                  _query2 = JSON.stringify({ _id: { $nin: covers } });
                  _context30.next = 9;
                  return context.client.mutate({ mutation: _constants.DeleteFilesMutation, variables: { query: _query2 } });

                case 9:
                  resolve(true);
                  _context30.next = 15;
                  break;

                case 12:
                  _context30.prev = 12;
                  _context30.t0 = _context30['catch'](0);

                  reject(_context30.t0);

                case 15:
                case 'end':
                  return _context30.stop();
              }
            }
          }, _callee30, _this29, [[0, 12]]);
        }));

        return function (_x58, _x59) {
          return _ref100.apply(this, arguments);
        };
      }());
    },
    addToCollection: function addToCollection(obj, _ref103, context, info) {
      var userId = _ref103.userId,
          bookId = _ref103.bookId;

      var _this30 = this;

      var Collection = context.db.model('Collection');
      return new Promise(function () {
        var _ref104 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(resolve, reject) {
          var col, books;
          return regeneratorRuntime.wrap(function _callee31$(_context31) {
            while (1) {
              switch (_context31.prev = _context31.next) {
                case 0:
                  _context31.prev = 0;
                  _context31.next = 3;
                  return Collection.findOne({ userId: userId }).exec();

                case 3:
                  col = _context31.sent;

                  if (!col) {
                    _context31.next = 16;
                    break;
                  }

                  if (!(col.books.findIndex(function (_ref105) {
                    var id = _ref105.id;
                    return id === bookId;
                  }) === -1)) {
                    _context31.next = 13;
                    break;
                  }

                  books = [].concat(_toConsumableArray(col.books), [{ id: bookId, iat: new Date() }]);

                  col.set('books', books);
                  _context31.next = 10;
                  return col.save();

                case 10:
                  resolve(true);
                  _context31.next = 14;
                  break;

                case 13:
                  resolve(false);

                case 14:
                  _context31.next = 19;
                  break;

                case 16:
                  _context31.next = 18;
                  return new Collection({ userId: userId, books: [{ id: bookId, iat: new Date() }] }).save();

                case 18:
                  resolve(true);

                case 19:
                  _context31.next = 24;
                  break;

                case 21:
                  _context31.prev = 21;
                  _context31.t0 = _context31['catch'](0);

                  reject(_context31.t0);

                case 24:
                case 'end':
                  return _context31.stop();
              }
            }
          }, _callee31, _this30, [[0, 21]]);
        }));

        return function (_x60, _x61) {
          return _ref104.apply(this, arguments);
        };
      }());
    },
    delFromCollection: function delFromCollection(obj, _ref106, context, info) {
      var userId = _ref106.userId,
          bookIds = _ref106.bookIds;

      var Collection = context.db.model('Collection');
      return Collection.findOneAndUpdate({ userId: userId }, { $pull: { books: { id: { $each: bookIds } } } }, { new: true }).exec();
    },
    addBookComment: function addBookComment(obj, _ref107, context) {
      var comment = _ref107.comment;

      var BookComment = context.db.model('BookComment');
      return new BookComment(comment).save();
    },
    removeBookComment: function removeBookComment(obj, _ref108, context) {
      var id = _ref108.id;

      var BookComment = context.db.model('BookComment');
      return BookComment.findByIdAndRemove(id).exec();
    },
    thumbBookComment: function thumbBookComment(obj, _ref109, context) {
      var id = _ref109.id,
          userId = _ref109.userId;

      var BookComment = context.db.model('BookComment');
      return BookComment.findOneAndUpdate({ _id: id, userId: { $ne: userId } }, { $addToSet: { useful: userId } }).exec();
    },
    unThumbBookComment: function unThumbBookComment(obj, _ref110, context) {
      var id = _ref110.id,
          userId = _ref110.userId;

      var BookComment = context.db.model('BookComment');
      return BookComment.findByIdAndUpdate(id, { $pull: { useful: userId } }).exec();
    },
    addToCart: function addToCart(obj, _ref111, context) {
      var _this31 = this;

      var userId = _ref111.userId,
          bookId = _ref111.bookId;

      var Cart = context.db.model('Cart');
      return new Promise(function () {
        var _ref112 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(resolve, reject) {
          var result;
          return regeneratorRuntime.wrap(function _callee32$(_context32) {
            while (1) {
              switch (_context32.prev = _context32.next) {
                case 0:
                  _context32.prev = 0;
                  _context32.next = 3;
                  return Cart.update({ userId: userId }, { $addToSet: { bookIds: bookId } }, { upsert: true }).exec();

                case 3:
                  result = _context32.sent;

                  // console.log(result)
                  resolve(!!result.nModified);
                  _context32.next = 10;
                  break;

                case 7:
                  _context32.prev = 7;
                  _context32.t0 = _context32['catch'](0);

                  reject(_context32.t0);

                case 10:
                case 'end':
                  return _context32.stop();
              }
            }
          }, _callee32, _this31, [[0, 7]]);
        }));

        return function (_x62, _x63) {
          return _ref112.apply(this, arguments);
        };
      }());
    },
    removeFromCart: function removeFromCart(obj, _ref113, context) {
      var _this32 = this;

      var bookId = _ref113.bookId;

      var Cart = context.db.model('Cart');
      return new Promise(function () {
        var _ref114 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(resolve, reject) {
          var _ref115, data, result;

          return regeneratorRuntime.wrap(function _callee33$(_context33) {
            while (1) {
              switch (_context33.prev = _context33.next) {
                case 0:
                  _context33.prev = 0;
                  _context33.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref115 = _context33.sent;
                  data = _ref115.data;

                  if (data.logedUser) {
                    _context33.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  _context33.next = 9;
                  return Cart.update({ userId: data.logedUser.id }, { $pull: { bookIds: bookId } }).exec();

                case 9:
                  result = _context33.sent;

                  resolve(!!result.nModified);
                  _context33.next = 16;
                  break;

                case 13:
                  _context33.prev = 13;
                  _context33.t0 = _context33['catch'](0);

                  reject(_context33.t0);

                case 16:
                case 'end':
                  return _context33.stop();
              }
            }
          }, _callee33, _this32, [[0, 13]]);
        }));

        return function (_x64, _x65) {
          return _ref114.apply(this, arguments);
        };
      }());
    },
    moveFromCartToCollection: function moveFromCartToCollection(obj, _ref116, context) {
      var _this33 = this;

      var bookId = _ref116.bookId;

      var Cart = context.db.model('Cart');
      var Collection = context.db.model('Collection');
      return new Promise(function () {
        var _ref117 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(resolve, reject) {
          var _ref118, data, collection, cart;

          return regeneratorRuntime.wrap(function _callee34$(_context34) {
            while (1) {
              switch (_context34.prev = _context34.next) {
                case 0:
                  _context34.prev = 0;
                  _context34.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref118 = _context34.sent;
                  data = _ref118.data;

                  if (data.logedUser) {
                    _context34.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  _context34.next = 9;
                  return Collection.update({ userId: data.logedUser.id, '$expr': { $not: { $in: [bookId, '$books.id'] } } }, { $push: { books: { id: bookId, iat: new Date() } } }, { upsert: true });

                case 9:
                  collection = _context34.sent;
                  _context34.next = 12;
                  return Cart.update({ userId: data.logedUser.id }, { $pull: { bookIds: bookId } }).exec();

                case 12:
                  cart = _context34.sent;

                  resolve(!!cart.nModified);
                  _context34.next = 19;
                  break;

                case 16:
                  _context34.prev = 16;
                  _context34.t0 = _context34['catch'](0);

                  reject(_context34.t0);

                case 19:
                case 'end':
                  return _context34.stop();
              }
            }
          }, _callee34, _this33, [[0, 16]]);
        }));

        return function (_x66, _x67) {
          return _ref117.apply(this, arguments);
        };
      }());
    },
    addToSubscription: function addToSubscription(obj, _ref119, context) {
      var _this34 = this;

      var isbn = _ref119.isbn;

      return new Promise(function () {
        var _ref120 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(resolve, reject) {
          var _ref121, data, Cart, result;

          return regeneratorRuntime.wrap(function _callee35$(_context35) {
            while (1) {
              switch (_context35.prev = _context35.next) {
                case 0:
                  _context35.prev = 0;
                  _context35.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref121 = _context35.sent;
                  data = _ref121.data;

                  if (data.logedUser) {
                    _context35.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  Cart = context.db.model('Cart');
                  _context35.next = 10;
                  return Cart.update({ userId: data.logedUser.id }, { $addToSet: { subscriptions: isbn } }, { upsert: true }).exec();

                case 10:
                  result = _context35.sent;

                  resolve(!!result.nModified);
                  _context35.next = 17;
                  break;

                case 14:
                  _context35.prev = 14;
                  _context35.t0 = _context35['catch'](0);

                  reject(_context35.t0);

                case 17:
                case 'end':
                  return _context35.stop();
              }
            }
          }, _callee35, _this34, [[0, 14]]);
        }));

        return function (_x68, _x69) {
          return _ref120.apply(this, arguments);
        };
      }());
    },
    removeFromSubscription: function removeFromSubscription(obj, _ref122, context) {
      var _this35 = this;

      var isbn = _ref122.isbn;

      return new Promise(function () {
        var _ref123 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36(resolve, reject) {
          var _ref124, data, Cart, result;

          return regeneratorRuntime.wrap(function _callee36$(_context36) {
            while (1) {
              switch (_context36.prev = _context36.next) {
                case 0:
                  _context36.prev = 0;
                  _context36.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref124 = _context36.sent;
                  data = _ref124.data;

                  if (data.logedUser) {
                    _context36.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  Cart = context.db.model('Cart');
                  _context36.next = 10;
                  return Cart.update({ userId: data.logedUser.id }, { $pull: { subscriptions: isbn } }).exec();

                case 10:
                  result = _context36.sent;

                  resolve(!!result.nModified);
                  _context36.next = 17;
                  break;

                case 14:
                  _context36.prev = 14;
                  _context36.t0 = _context36['catch'](0);

                  reject(_context36.t0);

                case 17:
                case 'end':
                  return _context36.stop();
              }
            }
          }, _callee36, _this35, [[0, 14]]);
        }));

        return function (_x70, _x71) {
          return _ref123.apply(this, arguments);
        };
      }());
    },
    addToBorrowPlan: function addToBorrowPlan(obj, _ref125, context) {
      var _this36 = this;

      var bookIds = _ref125.bookIds,
          expireAt = _ref125.expireAt;

      var Reserve = context.db.model('Reserve');
      var Cart = context.db.model('Cart');
      return new Promise(function () {
        var _ref126 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37(resolve, reject) {
          var _ref127, data, maxHoldCount, borrowPlan, plan, result;

          return regeneratorRuntime.wrap(function _callee37$(_context37) {
            while (1) {
              switch (_context37.prev = _context37.next) {
                case 0:
                  _context37.prev = 0;
                  _context37.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref127 = _context37.sent;
                  data = _ref127.data;

                  if (data.logedUser) {
                    _context37.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  maxHoldCount = data.logedUser.statistics.maxHoldCount; // 当前用户最多可借书的数量

                  _context37.next = 10;
                  return Reserve.findOne({ userId: data.logedUser.id }).exec();

                case 10:
                  borrowPlan = _context37.sent;

                  maxHoldCount = maxHoldCount - borrowPlan.bookIds.length; // 减去当前已预约的书的数量

                  if (!(bookIds.length > maxHoldCount)) {
                    _context37.next = 14;
                    break;
                  }

                  throw new Error('\u60A8\u5F53\u524D\u6700\u591A\u53EA\u80FD\u9884\u7EA6' + maxHoldCount + '\u672C\u4E66');

                case 14:
                  _context37.next = 16;
                  return Reserve.update({ userId: data.logedUser.id, kind: 'BORROW' }, { expireAt: expireAt, $addToSet: { bookIds: { $each: bookIds } } }, { upsert: true }).exec();

                case 16:
                  plan = _context37.sent;

                  if (plan.nModified) {
                    _context37.next = 19;
                    break;
                  }

                  throw new Error('已经预约过了');

                case 19:
                  _context37.next = 21;
                  return Cart.update({ userId: data.logedUser.id }, { $pull: { bookIds: { $in: bookIds } } }).exec();

                case 21:
                  result = _context37.sent;

                  // console.log(plan.nModified)
                  resolve(!!result.nModified);
                  _context37.next = 28;
                  break;

                case 25:
                  _context37.prev = 25;
                  _context37.t0 = _context37['catch'](0);

                  reject(_context37.t0);

                case 28:
                case 'end':
                  return _context37.stop();
              }
            }
          }, _callee37, _this36, [[0, 25]]);
        }));

        return function (_x72, _x73) {
          return _ref126.apply(this, arguments);
        };
      }());
    },
    removeFromBorrowPlan: function removeFromBorrowPlan(obj, _ref128, context) {
      var _this37 = this;

      var bookIds = _ref128.bookIds;

      var Reserve = context.db.model('Reserve');
      return new Promise(function () {
        var _ref129 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38(resolve, reject) {
          var _ref130, data, result;

          return regeneratorRuntime.wrap(function _callee38$(_context38) {
            while (1) {
              switch (_context38.prev = _context38.next) {
                case 0:
                  _context38.next = 2;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 2:
                  _ref130 = _context38.sent;
                  data = _ref130.data;

                  if (data.logedUser) {
                    _context38.next = 6;
                    break;
                  }

                  throw new Error('用户未登录');

                case 6:
                  _context38.next = 8;
                  return Reserve.update({ userId: data.logedUser.id, kind: 'BORROW' }, { $pull: { bookIds: { $in: bookIds } } }).exec();

                case 8:
                  result = _context38.sent;

                  // console.log(result)
                  resolve(!!result.nModified);

                case 10:
                case 'end':
                  return _context38.stop();
              }
            }
          }, _callee38, _this37);
        }));

        return function (_x74, _x75) {
          return _ref129.apply(this, arguments);
        };
      }());
    },
    moveToCart: function moveToCart(obj, _ref131, context) {
      var _this38 = this;

      var bookId = _ref131.bookId;

      return new Promise(function () {
        var _ref132 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39(resolve, reject) {
          var _ref133, data, userId, Reserve, result, Cart, res;

          return regeneratorRuntime.wrap(function _callee39$(_context39) {
            while (1) {
              switch (_context39.prev = _context39.next) {
                case 0:
                  _context39.prev = 0;
                  _context39.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref133 = _context39.sent;
                  data = _ref133.data;

                  if (data.logedUser) {
                    _context39.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  userId = data.logedUser.id;
                  Reserve = context.db.model('Reserve');
                  _context39.next = 11;
                  return Reserve.update({ userId: userId, kind: 'BORROW' }, { $pull: { bookIds: bookId } }).exec();

                case 11:
                  result = _context39.sent;

                  if (result.nModified) {
                    _context39.next = 14;
                    break;
                  }

                  throw new Error('从预约中删除失败');

                case 14:
                  Cart = context.db.model('Cart');
                  _context39.next = 17;
                  return Cart.update({ userId: userId }, { $addToSet: { bookIds: bookId } }, { upsert: true }).exec();

                case 17:
                  res = _context39.sent;

                  if (res.nModified) {
                    _context39.next = 20;
                    break;
                  }

                  throw new Error('向书单中添加失败');

                case 20:
                  resolve(true);
                  _context39.next = 26;
                  break;

                case 23:
                  _context39.prev = 23;
                  _context39.t0 = _context39['catch'](0);

                  reject(_context39.t0);

                case 26:
                case 'end':
                  return _context39.stop();
              }
            }
          }, _callee39, _this38, [[0, 23]]);
        }));

        return function (_x76, _x77) {
          return _ref132.apply(this, arguments);
        };
      }());
    },
    addPost: function addPost(obj, _ref134, context) {
      var _this39 = this;

      var message = _ref134.message,
          messageType = _ref134.messageType,
          sessionId = _ref134.sessionId;

      return new Promise(function () {
        var _ref135 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee40(resolve, reject) {
          var _ref136, data, Conversation, _ref137, participators, status, post, Post, postAdded;

          return regeneratorRuntime.wrap(function _callee40$(_context40) {
            while (1) {
              switch (_context40.prev = _context40.next) {
                case 0:
                  _context40.prev = 0;
                  _context40.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref136 = _context40.sent;
                  data = _ref136.data;

                  if (data.logedUser) {
                    _context40.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  Conversation = context.db.model('Conversation');
                  _context40.next = 10;
                  return Conversation.findById(sessionId, 'participators').exec();

                case 10:
                  _ref137 = _context40.sent;
                  participators = _ref137.participators;

                  // console.log(participators.length)
                  status = participators.filter(function (userId) {
                    return userId !== data.logedUser.id;
                  }).map(function (id) {
                    return { receiver: id, unread: true };
                  });
                  post = {
                    message: message,
                    sessionId: sessionId,
                    status: status,
                    messageType: messageType || 'text',
                    iat: new Date(),
                    postBy: data.logedUser.id
                  };
                  Post = context.db.model('Post');
                  _context40.next = 17;
                  return new Post(post).save();

                case 17:
                  postAdded = _context40.sent;

                  // 在publish之前必须对Date进行序列化，因为publish的数据是不会通过Date的resolver进行序列化的
                  // let obj = postAdded.toObject()
                  // obj = {...obj, iat: obj.iat.getTime(), id: obj._id}
                  // console.log(obj)
                  pubsub.publish(POST_ADDED, { postAdded: postAdded });
                  resolve(postAdded);
                  _context40.next = 25;
                  break;

                case 22:
                  _context40.prev = 22;
                  _context40.t0 = _context40['catch'](0);

                  reject(_context40.t0);

                case 25:
                case 'end':
                  return _context40.stop();
              }
            }
          }, _callee40, _this39, [[0, 22]]);
        }));

        return function (_x78, _x79) {
          return _ref135.apply(this, arguments);
        };
      }());
    },
    commitFeedback: function commitFeedback(obj, _ref138, context) {
      var _this40 = this;

      var category = _ref138.category,
          description = _ref138.description;

      var Feedback = context.db.model('Feedback');
      return new Promise(function () {
        var _ref139 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee41(resolve, reject) {
          var _ref140, data, feedback;

          return regeneratorRuntime.wrap(function _callee41$(_context41) {
            while (1) {
              switch (_context41.prev = _context41.next) {
                case 0:
                  _context41.next = 2;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 2:
                  _ref140 = _context41.sent;
                  data = _ref140.data;

                  if (data.logedUser) {
                    _context41.next = 6;
                    break;
                  }

                  throw new Error('用户未登录');

                case 6:
                  _context41.prev = 6;
                  _context41.next = 9;
                  return new Feedback({
                    category: category,
                    description: description,
                    postBy: data.logedUser.id,
                    iat: new Date(),
                    status: 'UNREAD'
                  }).save();

                case 9:
                  feedback = _context41.sent;

                  resolve(true);
                  _context41.next = 16;
                  break;

                case 13:
                  _context41.prev = 13;
                  _context41.t0 = _context41['catch'](6);

                  reject(_context41.t0);

                case 16:
                case 'end':
                  return _context41.stop();
              }
            }
          }, _callee41, _this40, [[6, 13]]);
        }));

        return function (_x80, _x81) {
          return _ref139.apply(this, arguments);
        };
      }());
    },
    handleFeedback: function handleFeedback(obj, _ref141, context) {
      var _this41 = this;

      var id = _ref141.id,
          status = _ref141.status,
          rejectReason = _ref141.rejectReason;

      var Feedback = context.db.model('Feedback');
      return new Promise(function () {
        var _ref142 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee42(resolve, reject) {
          var _ref143, data, adminEmail, feedback, nodemailer, transporter, result, mailOptions;

          return regeneratorRuntime.wrap(function _callee42$(_context42) {
            while (1) {
              switch (_context42.prev = _context42.next) {
                case 0:
                  _context42.next = 2;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 2:
                  _ref143 = _context42.sent;
                  data = _ref143.data;

                  if (data.logedUser) {
                    _context42.next = 6;
                    break;
                  }

                  throw new Error('用户未登录');

                case 6:
                  adminEmail = data.logedUser.email;

                  if (data.logedUser.role.isAdmin) {
                    _context42.next = 9;
                    break;
                  }

                  throw new Error('没有权限操作');

                case 9:
                  _context42.prev = 9;
                  _context42.next = 12;
                  return Feedback.findByIdAndUpdate(id, { status: status }).exec();

                case 12:
                  feedback = _context42.sent;

                  if (!(feedback.postedUser && feedback.postedUser.email)) {
                    _context42.next = 27;
                    break;
                  }

                  nodemailer = require('nodemailer');
                  transporter = nodemailer.createTransport({
                    host: 'smtp.163.com',
                    port: 465,
                    secure: true,
                    auth: {
                      user: _settings.emailAccount,
                      pass: _settings.emailPassword
                    }
                  });
                  result = '';
                  _context42.t0 = status;
                  _context42.next = _context42.t0 === 'ADOPTED' ? 20 : _context42.t0 === 'REJECTED' ? 22 : 24;
                  break;

                case 20:
                  result = '您的意见已经被采纳，工程师正在改进中。。。';
                  return _context42.abrupt('break', 25);

                case 22:
                  result = '\u60A8\u7684\u610F\u89C1\u7ECF\u6838\u67E5\u672A\u88AB\u91C7\u7EB3\uFF0C\u539F\u56E0\u662F\uFF1A' + rejectReason + '\u3002';
                  return _context42.abrupt('break', 25);

                case 24:
                  result = '您的意见已经被采纳，错误已经修复或者新功能已经添加，欢迎体验并再次反馈！';

                case 25:
                  mailOptions = {
                    from: '"\u7BA1\u7406\u5458" <' + _settings.emailAccount + '>',
                    to: feedback.postedUser.email,
                    subject: '感谢您的反馈',
                    text: result,
                    html: '<div><h1>' + result + '</h1></div>'
                  };

                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      reject(error);
                    }
                    resolve(true);
                  });

                case 27:
                  resolve(true);
                  _context42.next = 33;
                  break;

                case 30:
                  _context42.prev = 30;
                  _context42.t1 = _context42['catch'](9);

                  reject(_context42.t1);

                case 33:
                case 'end':
                  return _context42.stop();
              }
            }
          }, _callee42, _this41, [[9, 30]]);
        }));

        return function (_x82, _x83) {
          return _ref142.apply(this, arguments);
        };
      }());
    },
    addToReturnPlan: function addToReturnPlan(obj, _ref144, context) {
      var _this42 = this;

      var bookIds = _ref144.bookIds,
          expireAt = _ref144.expireAt;

      var Reserve = context.db.model('Reserve');
      return new Promise(function () {
        var _ref145 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee43(resolve, reject) {
          var _ref146, data, plan;

          return regeneratorRuntime.wrap(function _callee43$(_context43) {
            while (1) {
              switch (_context43.prev = _context43.next) {
                case 0:
                  _context43.prev = 0;
                  _context43.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref146 = _context43.sent;
                  data = _ref146.data;

                  if (data.logedUser) {
                    _context43.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  _context43.next = 9;
                  return Reserve.update({ userId: data.logedUser.id, kind: 'RETURN' }, {
                    expireAt: expireAt,
                    $addToSet: { bookIds: { $each: bookIds } }
                  }, { upsert: true }).exec();

                case 9:
                  plan = _context43.sent;

                  resolve(!!plan.nModified);
                  _context43.next = 16;
                  break;

                case 13:
                  _context43.prev = 13;
                  _context43.t0 = _context43['catch'](0);

                  reject(_context43.t0);

                case 16:
                case 'end':
                  return _context43.stop();
              }
            }
          }, _callee43, _this42, [[0, 13]]);
        }));

        return function (_x84, _x85) {
          return _ref145.apply(this, arguments);
        };
      }());
    },
    createReadPlan: function createReadPlan(obj, _ref147, context) {
      var _this43 = this;

      var plans = _ref147.plans,
          title = _ref147.title;

      return new Promise(function () {
        var _ref148 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee44(resolve, reject) {
          var _ref149, data, ReadPlan, readPlan;

          return regeneratorRuntime.wrap(function _callee44$(_context44) {
            while (1) {
              switch (_context44.prev = _context44.next) {
                case 0:
                  _context44.prev = 0;
                  _context44.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref149 = _context44.sent;
                  data = _ref149.data;

                  if (data.logedUser) {
                    _context44.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  ReadPlan = context.db.model('ReadPlan');
                  _context44.next = 10;
                  return new ReadPlan({ plans: plans, title: title, userId: data.logedUser.id, createAt: new Date() }).save();

                case 10:
                  readPlan = _context44.sent;

                  resolve(readPlan);
                  _context44.next = 17;
                  break;

                case 14:
                  _context44.prev = 14;
                  _context44.t0 = _context44['catch'](0);

                  reject(_context44.t0);

                case 17:
                case 'end':
                  return _context44.stop();
              }
            }
          }, _callee44, _this43, [[0, 14]]);
        }));

        return function (_x86, _x87) {
          return _ref148.apply(this, arguments);
        };
      }());
    },
    delReadPlan: function delReadPlan(obj, _ref150, context) {
      var _this44 = this;

      var id = _ref150.id;

      return new Promise(function () {
        var _ref151 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee45(resolve, reject) {
          var _ref152, data, ReadPlan, plan;

          return regeneratorRuntime.wrap(function _callee45$(_context45) {
            while (1) {
              switch (_context45.prev = _context45.next) {
                case 0:
                  _context45.prev = 0;
                  _context45.next = 3;
                  return context.client.query({ query: _constants.GetLogedUserIDQuery });

                case 3:
                  _ref152 = _context45.sent;
                  data = _ref152.data;

                  if (data.logedUser) {
                    _context45.next = 7;
                    break;
                  }

                  throw new Error('用户未登录');

                case 7:
                  ReadPlan = context.db.model('ReadPlan');
                  plan = ReadPlan.findByIdAndRemove(id).exec();

                  resolve(!!plan);
                  _context45.next = 15;
                  break;

                case 12:
                  _context45.prev = 12;
                  _context45.t0 = _context45['catch'](0);

                  reject(_context45.t0);

                case 15:
                case 'end':
                  return _context45.stop();
              }
            }
          }, _callee45, _this44, [[0, 12]]);
        }));

        return function (_x88, _x89) {
          return _ref151.apply(this, arguments);
        };
      }());
    }
  },
  Subscription: {
    postAdded: {
      subscribe: (0, _graphqlSubscriptions.withFilter)(function () {
        return pubsub.asyncIterator(POST_ADDED);
      }, function (payload, variables) {
        return payload.postAdded.sessionId === variables.sessionId;
      })
    }
  }
};
exports.default = resolvers;
//# sourceMappingURL=resolvers.js.map