const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

const creatorFields = { username: 1, name: 1 }

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({}).populate('user', creatorFields)
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', creatorFields)
  if (!blog) return response.status(404).json({ error: 'blog not found' })
  return response.json(blog)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body ?? {}
  const blog = new Blog({ title, author, url, likes, user: request.user.id })
  const saved = await blog.save()
  await saved.populate('user', creatorFields)
  return response.status(201).json(saved)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) return response.status(404).json({ error: 'blog not found' })
  if (!blog.user.equals(request.user.id)) {
    return response.status(403).json({ error: 'only creator may delete blog' })
  }
  await blog.deleteOne()
  return response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { likes } = request.body ?? {}
  if (typeof likes !== 'number' || !Number.isFinite(likes)) {
    return response.status(400).json({ error: 'likes must be a number' })
  }
  const updated = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes },
    { new: true, runValidators: true },
  ).populate('user', creatorFields)
  if (!updated) return response.status(404).json({ error: 'blog not found' })
  return response.json(updated)
})

module.exports = blogsRouter
