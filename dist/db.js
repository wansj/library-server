'use strict';

var _transactions = require('./graphql/transactions');

var _transactions2 = _interopRequireDefault(_transactions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var mongoose = require('mongoose');

var _require = require('./settings'),
    host = _require.host,
    port = _require.port,
    database = _require.database;

mongoose.connect('mongodb://' + host + ':' + port + '/' + database, { useMongoClient: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;

var transactionChecker = function transactionChecker() {
  var _this = this;

  return setInterval(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var context;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            context = { db: db };
            _context.prev = 1;
            _context.next = 4;
            return _transactions2.default.Books.recoverFromPending(context);

          case 4:
            _context.next = 9;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context['catch'](1);

            console.log(_context.t0);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this, [[1, 6]]);
  })), 30 * 60 * 1000);
};
var timer = null;
db.on('error', function () {
  console.error('connection error');
  clearInterval(timer);
});
db.once('open', function () {
  console.log('db is running on port: ' + port);
  timer = transactionChecker();
});
module.exports = db;
//# sourceMappingURL=db.js.map