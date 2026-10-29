const loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body ?? {}
  const user = typeof username === 'string' ? await User.findOne({ username }) : null
  const correct = user && typeof password === 'string'
    ? await bcrypt.compare(password, user.passwordHash)
    : false
  if (!correct) return response.status(401).json({ error: 'invalid username or password' })
  const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET, { expiresIn: '1h' })
  return response.json({ token, username: user.username, name: user.name, id: user.id })
})

module.exports = loginRouter
