const express = require('express')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const { tokenExtractor, unknownEndpoint, errorHandler } = require('./utils/middleware')

const createApp = ({ testingRouter } = {}) => {
  const app = express()
  app.use(express.json())
  app.use(tokenExtractor)
  app.use('/api/blogs', blogsRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/login', loginRouter)
  // Only the owner of a disposable test database supplies this capability.
  // The ordinary exported app never enables destructive routes from env alone.
  if (process.env.NODE_ENV === 'test' && testingRouter) {
    app.use('/api/testing', testingRouter)
  }
  app.use(unknownEndpoint)
  app.use(errorHandler)
  return app
}

module.exports = createApp()
module.exports.createApp = createApp
