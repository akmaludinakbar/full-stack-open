const dummy = () => 1

const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0)

const favoriteBlog = (blogs) => blogs.reduce(
  (favorite, blog) => (!favorite || blog.likes > favorite.likes ? blog : favorite), null,
)

const topAuthor = (blogs, valueKey, valueOf) => {
  if (blogs.length === 0) return null
  const totals = new Map()
  for (const blog of blogs) {
    totals.set(blog.author, (totals.get(blog.author) || 0) + valueOf(blog))
  }
  const [author, value] = [...totals].reduce(
    (top, entry) => (entry[1] > top[1] ? entry : top), ['', -Infinity],
  )
  return { author, [valueKey]: value }
}

const mostBlogs = (blogs) => topAuthor(blogs, 'blogs', () => 1)
const mostLikes = (blogs) => topAuthor(blogs, 'likes', (blog) => blog.likes)

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }
