import { useState } from 'react'
import { Button, Paper, Stack, TextField, Typography } from '@mui/material'

export default function BlogForm({ onCreate, onCancel, pending }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  function submit(event) {
    event.preventDefault()
    if (pending) return
    void onCreate({ title, author, url })
  }

  return <Paper component="form" aria-label="Create blog" onSubmit={submit} variant="outlined" sx={{ p: { xs: 3, sm: 4 }, maxWidth: 600, mx: 'auto' }}>
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">Create a blog</Typography>
      <TextField label="Title" slotProps={{ htmlInput: { 'aria-label': 'Title' } }} value={title} onChange={event => setTitle(event.target.value)} required fullWidth />
      <TextField label="Author" value={author} onChange={event => setAuthor(event.target.value)} fullWidth />
      <TextField label="URL" type="url" slotProps={{ htmlInput: { 'aria-label': 'URL' } }} value={url} onChange={event => setUrl(event.target.value)} required fullWidth />
      <Stack direction="row" spacing={2}>
        <Button variant="contained" type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create'}</Button>
        <Button type="button" onClick={onCancel} disabled={pending}>Cancel</Button>
      </Stack>
    </Stack>
  </Paper>
}
