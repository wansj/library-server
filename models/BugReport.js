const mongoose = require('mongoose')

const BugReportSchema = mongoose.Schema({
  keyword: {type: String, required: true}, // 只能是Cover、Book、Custom之一
  description: String,  // keyword为Custom时必须
  coverId: String, // keyword为Cover时才必须, 外键
  bookId: {type: String, required: true}, // 外键
  status: {type: String, required: true}, // 只能是New、Read、Confirmed、Resolved、Rejected之一
  reporter: String, // 报告BUG的人, 外键
  createAt: {type: Date, default: Date.now(), required: true} //录入日期
})
let BugReport = null
try {
  BugReport = mongoose.model('BugReport', BugReportSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    BugReport = mongoose.model('BugReport')
  }
}

module.exports = BugReport
