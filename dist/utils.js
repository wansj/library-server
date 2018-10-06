'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fmtPostDate = undefined;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fmtPostDate = exports.fmtPostDate = function fmtPostDate(issueAt) {
  var iat = (0, _moment2.default)(issueAt);
  var weekAgo = (0, _moment2.default)().hour(0).minute(0).second(0).subtract(7, 'days');
  var twoDaysAgo = (0, _moment2.default)().hour(0).minute(0).second(0).subtract(1, 'days');
  // 今年以前，显示全称
  if (!iat.isSame((0, _moment2.default)(), 'year')) {
    return iat.format('YYYY年M月D日 aHH:mm');
  } else if (iat.isBefore(weekAgo)) {
    //一周之前，省略年份
    return iat.format('M月D日 aHH:mm');
  } else if (iat.isBefore(twoDaysAgo)) {
    //两天之前，显示周几
    return iat.format('dddd HH:mm');
  } else if (iat.isSame((0, _moment2.default)(), 'day')) {
    //如果是今天,只显示时间
    return iat.format('HH:mm');
  } else {
    return iat.format('昨天 HH:mm');
  }
};
//# sourceMappingURL=utils.js.map