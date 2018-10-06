import Transaction from './graphql/transactions'

const mongoose = require('mongoose')
const {host, port, database} = require('./settings')
mongoose.connect(`mongodb://${host}:${port}/${database}`, { useMongoClient:true })
mongoose.Promise = global.Promise
const db = mongoose.connection

const transactionChecker = function () {
  return setInterval(async () => {
    const context = { db }
    try {
      await Transaction.Books.recoverFromPending(context)
    } catch (e) {
      console.log(e)
    }
  }, 30*60*1000)
}
let timer = null
db.on('error', function () {
  console.error('connection error')
  clearInterval(timer)
})
db.once('open', function () {
  console.log(`db is running on port: ${port}`)
  timer = transactionChecker()
})
module.exports = db
