import mongoose from 'mongoose'

const BookCommentSchema = mongoose.Schema({
  bookId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    minlength: 1,
    maxlength: 50,
    required: true
  },
  details: {
    type: String,
    minlength: 1,
    maxlength: 600,
    required: true
  },
  score: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  useful: {
    type: [String],
    default: []
  },
  postDate: {
    type: Date,
    default: Date.now()
  }
})
let BookComment = null
try {
  BookComment = mongoose.model('BookComment', BookCommentSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    BookComment = mongoose.model('BookComment')
  }
}
export default BookComment