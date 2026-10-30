import { Link as RouterLink, useParams } from 'react-router-dom'
import { Link, Stack, Typography } from '@mui/material'
import Blog from './Blog'

export default function BlogPage({ blogs, ownerId, busyIds, onLike, onDelete }) {
  const { id } = useParams()
  const blog = blogs.find(item => item.id === id)
  return <Stack spacing={3}>
    <Link component={RouterLink} to="/">Back to blogs</Link>
    {blog ? <Blog blog={blog} ownerId={ownerId} busy={busyIds.includes(id)} onLike={onLike} onDelete={onDelete} />
      : <Typography component="h1" variant="h4">Blog not found</Typography>}
  </Stack>
}
