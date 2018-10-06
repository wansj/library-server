import mongoose from 'mongoose'

const ReadPlanSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  plans: {
    type: Array,
    required: true,
    validate: {
      validator: function (v) {
        return !v.hasOwnProperty('bookId') || !v.hasOwnProperty('timespan')
      },
      message: 'plans必须包含bookId和timespan属性'
    }
  },
  createAt: {
    type: Date,
    required: true
  }
})
let ReadPlan = null
try {
  ReadPlan = mongoose.model('ReadPlan', ReadPlanSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    ReadPlan = mongoose.model('ReadPlan')
  }
}
export default ReadPlan