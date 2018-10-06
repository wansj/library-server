'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReserveSchema = _mongoose2.default.Schema({
  kind: { type: String, enum: ['BORROW', 'RETURN'], required: true },
  userId: { type: String, required: true, unique: true },
  bookIds: { type: [_mongoose2.default.Schema.Types.ObjectId], required: true },
  expireAt: { type: Date, required: true }
});
ReserveSchema.index({ expireAt: 1 }, { expires: 0 });
var Reserve = null;
try {
  Reserve = _mongoose2.default.model('Reserve', ReserveSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Reserve = _mongoose2.default.model('Reserve');
  }
}
exports.default = Reserve;
//# sourceMappingURL=BorrowPlan.js.map