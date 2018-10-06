import mongoose from 'mongoose'

const CollectionSchema = mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  // bookIds: { type: [String], required: true }
  books: {
    type: Array,
    required: true,
    default: [],
    validate: {
      validator: function (v) {
        return !v.hasOwnProperty('id') || !v.hasOwnProperty('iat')
      },
      message: 'plans必须包含id和iat属性'
    }
  }
})
let Collection = null
try {
  Collection = mongoose.model('Collection', CollectionSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Collection = mongoose.model('Collection')
  }
}
export default Collection