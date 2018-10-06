'use strict';

var mongoose = require('mongoose');

var BookSchema = mongoose.Schema({
  isbn: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  authors: { type: [String], required: [true, 'At least an author!'] },
  translators: [String],
  summary: String, //简介
  publisher: { type: String, required: true }, //出版社
  version: { type: Number, default: 1, min: 1 }, //第几版
  pubDate: { type: Date }, //出版日期
  createAt: { type: Date, default: Date.now(), required: true }, //录入日期
  price: { type: Number }, //价格
  location: String, //存放位置,格式为1-1，代表第一个书架第一层
  volume: { type: Number, default: 1, min: 1 }, //册数
  count: { type: Number, default: 1, min: 0 }, //数量
  category: String, //类别
  cover: String,
  pendingTransaction: { type: [String], default: [] }
});
BookSchema.index({ "$**": "text" });
BookSchema.methods.canBorrow = function () {
  return this.count > 0;
};
var Book = null;
try {
  Book = mongoose.model('Book', BookSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Book = mongoose.model('Book');
  }
}

module.exports = Book;
//# sourceMappingURL=Book.js.map