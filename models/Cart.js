import mongoose from 'mongoose'

const CartSchema = mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  bookIds: { type: [mongoose.Schema.Types.ObjectId], required: true },
  subscriptions: { type: [String], default: [] }
})
let Cart = null
try {
  Cart = mongoose.model('Cart', CartSchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Cart = mongoose.model('Cart')
  }
}
export default Cart