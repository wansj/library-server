'use strict';

var mongoose = require('mongoose');

var CategorySchema = mongoose.Schema({
  label: { type: String, required: true },
  parent: mongoose.Schema.Types.ObjectId
});
var Category = null;
try {
  Category = mongoose.model('Category', CategorySchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Category = mongoose.model('Category');
  }
}

module.exports = Category;
//# sourceMappingURL=Category.js.map