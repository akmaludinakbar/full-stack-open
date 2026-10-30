import { Button, Link, Paper, Stack, Typography } from '@mui/material'

export default function Blog({ blog, ownerId, busy, onLike, onDelete }) {
  return <Paper component="article" variant="outlined" sx={{ p: { xs: 3, sm: 4 } }}>
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">{blog.title}</Typography>
      <Typography color="text.secondary">by {blog.author || 'Unknown author'}</Typography>
      <Link href={blog.url} target="_blank" rel="noreferrer" sx={{ overflowWrap: 'anywhere' }}>{blog.url}</Link>
      <Typography>Likes: {blog.likes}</Typography>
      <Typography color="text.secondary">Added by {blog.user?.name || blog.user?.username || 'Unknown user'}</Typography>
      {ownerId && <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => onLike(blog)} disabled={busy}>Like</Button>
        {blog.user?.id === ownerId && <Button variant="outlined" color="error" onClick={() => onDelete(blog)} disabled={busy}>Delete</Button>}
      </Stack>}
    </Stack>
  </Paper>
}
