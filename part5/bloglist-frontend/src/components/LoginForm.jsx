import { Button, Paper, Stack, TextField, Typography } from '@mui/material'

export default function LoginForm({ username, password, onUsername, onPassword, pending, onSubmit }) {
  return <Paper component="form" aria-label="Log in" onSubmit={onSubmit} variant="outlined" sx={{ p: { xs: 3, sm: 4 }, maxWidth: 480, mx: 'auto' }}>
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">Log in</Typography>
      <TextField label="Username" autoComplete="username" slotProps={{ htmlInput: { 'aria-label': 'Username' } }} value={username} onChange={event => onUsername(event.target.value)} required fullWidth />
      <TextField label="Password" type="password" autoComplete="current-password" slotProps={{ htmlInput: { 'aria-label': 'Password' } }} value={password} onChange={event => onPassword(event.target.value)} required fullWidth />
      <Button variant="contained" size="large" type="submit" disabled={pending}>{pending ? 'Logging in…' : 'Log in'}</Button>
    </Stack>
  </Paper>
}
