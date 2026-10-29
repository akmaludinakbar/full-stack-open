const mongoose = require('mongoose')
const app = require('./app')
const config = require('./utils/config')

const start = async () => {
  config.requireProductionConfig()
  await mongoose.connect(config.MONGODB_URI)
  app.listen(config.PORT, () => console.log(`Bloglist API listening on port ${config.PORT}`))
}

start().catch(() => {
  console.error('Bloglist API could not start. Check database availability and configuration.')
  process.exitCode = 1
})
