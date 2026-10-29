const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  url: { type: String, required: true },
  likes: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
})

blogSchema.set('toJSON', {
  transform: (_document, returned) => {
    returned.id = returned._id.toString()
    delete returned._id
    delete returned.__v
    return returned
  },
})

module.exports = mongoose.model('Blog', blogSchema)
