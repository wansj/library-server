'use strict';

// import { MAX_BORROW_DURATION, MAX_DELAY_TIMES, MAX_DELAY_DAYS } from '../settings'
var mongoose = require('mongoose');

var RecordSchema = mongoose.Schema({
  userId: { type: String, required: true },
  isbn: { type: String, required: true },
  state: { type: String, required: true },
  date: { type: Date, default: Date.now() },
  deadline: { type: Date, required: true },
  returnDate: { type: Date }, //实际还书日期
  lastModified: { type: Date, default: Date.now() },
  delayTimes: { type: Number, default: 0 }
});
var Record = null;
try {
  Record = mongoose.model('Record', RecordSchema);
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Record = mongoose.model('Record');
  }
}
module.exports = Record;
//# sourceMappingURL=Record.js.map