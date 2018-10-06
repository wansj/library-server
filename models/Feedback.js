import mongoose from 'mongoose'

const FeedbackSchema = mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['BUG', 'ADVICE']
  },
  description: {
    required: true,
    type: String
  },
  postBy: {
    required: true,
    type: String
  },
  iat: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    default: 'UNREAD',
    required: true,
    enum: ['UNREAD', 'ADOPTED', 'REJECTED', 'RESOLVED']
  }
})
let Feedback = null
try {
  Feedback = mongoose.model('Feedback', FeedbackSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Feedback = mongoose.model('Feedback')
  }
}
export default Feedback