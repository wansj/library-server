'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CartSchema = _mongoose2.default.Schema({
  userId: { type: String, required: true, unique: true },
  bookIds: { type: [_mongoose2.default.Schema.Types.ObjectId], required: true },
  subscriptions: { type: [String], default: [] }
});
var Cart = null;
try {
  Cart = _mongoose2.default.model('Cart', CartSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Cart = _mongoose2.default.model('Cart');
  }
}
exports.default = Cart;
//# sourceMappingURL=Cart.js.map