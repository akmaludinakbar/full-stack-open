const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, _response, next) => {
  const authorization = request.get('authorization')
  request.token = authorization && /^Bearer\s+\S+$/i.test(authorization)
    ? authorization.split(/\s+/)[1]
    : null
  next()
}

const userExtractor = async (request, response, next) => {
  if (!request.token) return response.status(401).json({ error: 'token missing or invalid' })
  const decoded = jwt.verify(request.token, process.env.SECRET)
  const user = decoded.id ? await User.findById(decoded.id) : null
  if (!user) return response.status(401).json({ error: 'token missing or invalid' })
  request.user = user
  next()
}

const unknownEndpoint = (_request, response) => response.status(404).json({ error: 'unknown endpoint' })

const errorHandler = (error, _request, response, _next) => {
  if (error.name === 'ValidationError') return response.status(400).json({ error: error.message })
  if (error.name === 'CastError') return response.status(400).json({ error: 'invalid id' })
  if (error.code === 11000) return response.status(400).json({ error: 'username must be unique' })
  if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  if (error instanceof SyntaxError && error.status === 400) {
    return response.status(400).json({ error: 'invalid JSON' })
  }
  return response.status(500).json({ error: 'internal server error' })
}

module.exports = { tokenExtractor, userExtractor, unknownEndpoint, errorHandler }
