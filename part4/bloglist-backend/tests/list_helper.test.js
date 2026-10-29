const { test, describe } = require('node:test')
const assert = require('node:assert/strict')
const { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes } = require('../utils/list_helper')

const blogs = [
  { title: 'First', author: 'Ada', likes: 2 },
  { title: 'Second', author: 'Grace', likes: 7 },
  { title: 'Third', author: 'Ada', likes: 8 },
]

describe('dummy', () => {
  test('dummy returns one for empty and populated lists', () => {
    assert.equal(dummy([]), 1)
    assert.equal(dummy(blogs), 1)
  })
})

describe('totalLikes', () => {
  test('totalLikes sums empty, one and multiple lists', () => {
    assert.equal(totalLikes([]), 0)
    assert.equal(totalLikes([blogs[0]]), 2)
    assert.equal(totalLikes(blogs), 17)
  })
})

describe('favoriteBlog', () => {
  test('favoriteBlog returns the original highest-liked blog', () => {
    assert.equal(favoriteBlog(blogs), blogs[2])
    assert.equal(favoriteBlog([]), null)
  })
})

describe('mostBlogs', () => {
  test('mostBlogs counts posts by author', () => {
    assert.deepEqual(mostBlogs(blogs), { author: 'Ada', blogs: 2 })
    assert.equal(mostBlogs([]), null)
  })
})

describe('mostLikes', () => {
  test('mostLikes aggregates likes by author', () => {
    assert.deepEqual(mostLikes(blogs), { author: 'Ada', likes: 10 })
    assert.equal(mostLikes([]), null)
  })
})
