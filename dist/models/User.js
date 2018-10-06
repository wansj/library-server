'use strict';

var mongoose = require('mongoose');
var UserSchema = mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  role: { type: String, required: true }
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
//# sourceMappingURL=User.js.map