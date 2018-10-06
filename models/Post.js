import mongoose from 'mongoose'

const PostSchema = mongoose.Schema({
  postBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  iat: {
    type: Date,
    default: Date.now()
  },
  status: {
    type: Array,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'book'],
    default: 'text'
  }
})
let Post = null
try {
  Post = mongoose.model('Post', PostSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Post = mongoose.model('Post')
  }
}

export default Post