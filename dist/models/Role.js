'use strict';

var mongoose = require('mongoose');
var RoleSchema = mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: String,
  isAdmin: { type: Boolean, default: false },
  maxBorrowDuration: { type: Number, min: 1, default: 30, max: 365, required: true },
  maxHoldCount: { type: Number, min: 1, default: 5, max: 100, required: true },
  maxDelayTimes: { type: Number, min: 0, default: 1, max: 3, required: true },
  maxDelayDays: { type: Number, min: 1, max: 90, default: 30, required: true }
});
var User = null;
try {
  User = mongoose.model('User', UserSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    User = mongoose.model('User');
  }
}
module.exports = User;
//# sourceMappingURL=Role.js.map