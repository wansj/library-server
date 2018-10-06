import mongoose from 'mongoose'

const ReserveSchema = mongoose.Schema({
  kind: {type: String, enum: ['BORROW', 'RETURN'], required: true},
  userId: { type: String, required: true, unique: true },
  bookIds: { type: [mongoose.Schema.Types.ObjectId], required: true },
  expireAt: { type: Date, required: true }
})
ReserveSchema.index({expireAt: 1}, {expires: 0})
let Reserve = null
try {
  Reserve = mongoose.model('Reserve', ReserveSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Reserve = mongoose.model('Reserve')
  }
}
export default Reserve