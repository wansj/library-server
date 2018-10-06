'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReadPlanSchema = _mongoose2.default.Schema({
  userId: {
    type: _mongoose2.default.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  plans: {
    type: Array,
    required: true,
    validate: {
      validator: function validator(v) {
        return !v.hasOwnProperty('bookId') || !v.hasOwnProperty('timespan');
      },
      message: 'plans必须包含bookId和timespan属性'
    }
  },
  createAt: {
    type: Date,
    required: true
  }
});
var ReadPlan = null;
try {
  ReadPlan = _mongoose2.default.model('ReadPlan', ReadPlanSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    ReadPlan = _mongoose2.default.model('ReadPlan');
  }
}
exports.default = ReadPlan;
//# sourceMappingURL=ReadPlan.js.map