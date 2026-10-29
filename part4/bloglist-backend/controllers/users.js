const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.get('/', async (_request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body ?? {}
  if (typeof username !== 'string' || username.trim().length < 3) {
    return response.status(400).json({ error: 'username must have at least 3 characters' })
  }
  if (typeof password !== 'string' || password.length < 3) {
    return response.status(400).json({ error: 'password must have at least 3 characters' })
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ username: username.trim(), name, passwordHash })
  const saved = await user.save()
  return response.status(201).json(saved)
})

module.exports = usersRouter
