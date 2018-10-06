const mongoose = require('mongoose')

const CategorySchema = mongoose.Schema({
  label: {type: String, required: true},
  parent: mongoose.Schema.Types.ObjectId
})
let Category = null
try {
  Category = mongoose.model('Category', CategorySchema)
} catch (e) {
  if (e.name === 'OverwriteModelError') {
    Category = mongoose.model('Category')
  }
}

module.exports = Category
