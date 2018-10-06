'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FeedbackSchema = _mongoose2.default.Schema({
  category: {
    type: String,
    required: true,
    enum: ['BUG', 'ADVICE']
  },
  description: {
    required: true,
    type: String
  },
  postBy: {
    required: true,
    type: String
  },
  iat: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    default: 'UNREAD',
    required: true,
    enum: ['UNREAD', 'ADOPTED', 'REJECTED', 'RESOLVED']
  }
});
var Feedback = null;
try {
  Feedback = _mongoose2.default.model('Feedback', FeedbackSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Feedback = _mongoose2.default.model('Feedback');
  }
}
exports.default = Feedback;
//# sourceMappingURL=Feedback.js.map