import mongoose from 'mongoose'

const ConversationSchema = mongoose.Schema({
  participators: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.length >= 2
      },
      message: '会话至少需要两个人'
    }
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  }
})
let Conversation = null
try {
  Conversation = mongoose.model('Conversation', ConversationSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Conversation = mongoose.model('Conversation')
  }
}

export default Conversation