'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Books = {
  // initialState借书时应为initial，还书时应为borrowed
  startTransaction: function startTransaction(context, isbn, initialState, userId) {
    return new Promise(function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
        var t, done;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return Books.retriveRecord(context, initialState, { isbn: isbn, userId: userId });

              case 3:
                t = _context.sent;
                _context.next = 6;
                return Books.updateStateToPending(context, t);

              case 6:
                _context.next = 8;
                return Books.applyTransaction(context, t);

              case 8:
                done = _context.sent;
                _context.next = 11;
                return Books.updateStateToDone(context, t, done);

              case 11:
                resolve('success');
                _context.next = 17;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context['catch'](0);

                reject(_context.t0);

              case 17:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined, [[0, 14]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
  },
  retriveRecord: function retriveRecord(context, state) {
    var option = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var Record = context.db.model('Record');
    var opts = _extends({ state: state }, option);
    if (state === 'pending' || state === 'applied') {
      var dateThreshold = new Date();
      dateThreshold.setMinutes(dateThreshold.getMinutes() - 30);
      opts.lastModified = { $lt: dateThreshold };
    }
    return Record.findOne(opts).exec();
  },
  updateStateToPending: function updateStateToPending(context, t) {
    var Record = context.db.model('Record');
    return Record.update({
      _id: t._id, state: t.state
    }, {
      $set: { state: "pending" },
      $currentDate: { lastModified: true }
    }).exec();
  },

  applyTransaction: function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(context, t) {
      var Book, book;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              Book = context.db.model('Book');
              _context3.prev = 1;
              _context3.next = 4;
              return Book.findOne({ isbn: t.isbn }).exec();

            case 4:
              book = _context3.sent;
              return _context3.abrupt('return', new Promise(function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve) {
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          if (!(book.pendingTransaction.indexOf(t._id) === -1)) {
                            _context2.next = 10;
                            break;
                          }

                          if (!book.canBorrow()) {
                            _context2.next = 7;
                            break;
                          }

                          _context2.next = 4;
                          return book.update({ $inc: { count: -1 }, $push: { pendingTransaction: t._id } }).exec();

                        case 4:
                          resolve('borrowed');
                          _context2.next = 8;
                          break;

                        case 7:
                          resolve('cancelled');

                        case 8:
                          _context2.next = 13;
                          break;

                        case 10:
                          _context2.next = 12;
                          return book.update({ $inc: { count: 1 }, $pull: { pendingTransaction: t._id } }).exec();

                        case 12:
                          resolve('returned');

                        case 13:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, undefined);
                }));

                return function (_x6) {
                  return _ref3.apply(this, arguments);
                };
              }()));

            case 8:
              _context3.prev = 8;
              _context3.t0 = _context3['catch'](1);
              throw _context3.t0;

            case 11:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined, [[1, 8]]);
    }));

    function applyTransaction(_x4, _x5) {
      return _ref2.apply(this, arguments);
    }

    return applyTransaction;
  }(),
  updateStateToDone: function updateStateToDone(context, t, done) {
    var Record = context.db.model('Record');
    var state = { state: done };
    var setAttrs = done === 'returned' ? _extends({}, state, { returnDate: Date.now() }) : state;
    var update = {
      $set: setAttrs,
      $currentDate: { lastModified: true }
    };
    return Record.update({ _id: t._id, state: "pending" }, update).exec();
  },

  recoverFromPending: function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(context) {
      var t, done;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return Transaction.Books.retriveRecord(context, 'pending');

            case 3:
              t = _context4.sent;

            case 4:
              if (!t) {
                _context4.next = 16;
                break;
              }

              _context4.next = 7;
              return Books.applyTransaction(context, t);

            case 7:
              done = _context4.sent;
              _context4.next = 10;
              return Books.updateStateToDone(context, t, done);

            case 10:
              console.log('Continue to finish Record: ' + t._id);
              _context4.next = 13;
              return Transaction.Books.retriveRecord(context, 'pending');

            case 13:
              t = _context4.sent;
              _context4.next = 4;
              break;

            case 16:
              _context4.next = 20;
              break;

            case 18:
              _context4.prev = 18;
              _context4.t0 = _context4['catch'](0);

            case 20:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined, [[0, 18]]);
    }));

    function recoverFromPending(_x7) {
      return _ref4.apply(this, arguments);
    }

    return recoverFromPending;
  }()
};
var Transaction = { Books: Books };
exports.default = Transaction;
//# sourceMappingURL=transactions.js.map