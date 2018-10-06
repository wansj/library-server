'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PostSchema = _mongoose2.default.Schema({
  postBy: {
    type: _mongoose2.default.Schema.Types.ObjectId,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  iat: {
    type: Date,
    default: Date.now()
  },
  status: {
    type: Array,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'book'],
    default: 'text'
  }
});
var Post = null;
try {
  Post = _mongoose2.default.model('Post', PostSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Post = _mongoose2.default.model('Post');
  }
}

exports.default = Post;
//# sourceMappingURL=Post.js.map