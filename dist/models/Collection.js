'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CollectionSchema = _mongoose2.default.Schema({
  userId: { type: String, required: true, unique: true },
  // bookIds: { type: [String], required: true }
  books: {
    type: Array,
    required: true,
    default: [],
    validate: {
      validator: function validator(v) {
        return !v.hasOwnProperty('id') || !v.hasOwnProperty('iat');
      },
      message: 'plans必须包含id和iat属性'
    }
  }
});
var Collection = null;
try {
  Collection = _mongoose2.default.model('Collection', CollectionSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Collection = _mongoose2.default.model('Collection');
  }
}
exports.default = Collection;
//# sourceMappingURL=Collection.js.map