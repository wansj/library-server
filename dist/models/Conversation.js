'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ConversationSchema = _mongoose2.default.Schema({
  participators: {
    type: [String],
    required: true,
    validate: {
      validator: function validator(v) {
        return v.length >= 2;
      },
      message: '会话至少需要两个人'
    }
  },
  posts: {
    type: [_mongoose2.default.Schema.Types.ObjectId],
    default: []
  }
});
var Conversation = null;
try {
  Conversation = _mongoose2.default.model('Conversation', ConversationSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Conversation = _mongoose2.default.model('Conversation');
  }
}

exports.default = Conversation;
//# sourceMappingURL=Conversation.js.map