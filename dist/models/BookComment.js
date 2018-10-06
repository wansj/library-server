'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BookCommentSchema = _mongoose2.default.Schema({
  bookId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    minlength: 1,
    maxlength: 50,
    required: true
  },
  details: {
    type: String,
    minlength: 1,
    maxlength: 600,
    required: true
  },
  score: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  useful: {
    type: [String],
    default: []
  },
  postDate: {
    type: Date,
    default: Date.now()
  }
});
var BookComment = null;
try {
  BookComment = _mongoose2.default.model('BookComment', BookCommentSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    BookComment = _mongoose2.default.model('BookComment');
  }
}
exports.default = BookComment;
//# sourceMappingURL=BookComment.js.map