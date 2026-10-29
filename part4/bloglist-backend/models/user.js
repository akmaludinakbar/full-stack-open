const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3, unique: true },
  name: String,
  passwordHash: { type: String, required: true },
})

userSchema.virtual('blogs', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'user',
})

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_document, returned) => {
    returned.id = returned._id.toString()
    delete returned._id
    delete returned.__v
    delete returned.passwordHash
    return returned
  },
})

module.exports = mongoose.model('User', userSchema)
