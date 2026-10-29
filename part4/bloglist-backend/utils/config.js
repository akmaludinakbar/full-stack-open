require('dotenv').config()

const PORT = Number(process.env.PORT || 3003)
const MONGODB_URI = process.env.MONGODB_URI
const SECRET = process.env.SECRET

const requireProductionConfig = () => {
  if (!MONGODB_URI || !SECRET) {
    throw new Error('MONGODB_URI and SECRET must be configured')
  }
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error('PORT must be a valid TCP port')
  }
}

module.exports = { PORT, MONGODB_URI, SECRET, requireProductionConfig }
