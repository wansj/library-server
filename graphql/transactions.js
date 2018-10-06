const Books = {
  // initialState借书时应为initial，还书时应为borrowed
  startTransaction: (context, isbn, initialState, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const t = await Books.retriveRecord(context, initialState, { isbn, userId })
        await Books.updateStateToPending(context, t)
        const done = await Books.applyTransaction(context, t)
        await Books.updateStateToDone(context, t, done)
        resolve('success')
      } catch (e) {
        reject(e)
      }
    })
  },
  retriveRecord (context, state, option = {}) {
    const Record = context.db.model('Record')
    let opts = { state, ...option }
    if (state === 'pending' || state === 'applied') {
      const dateThreshold = new Date()
      dateThreshold.setMinutes(dateThreshold.getMinutes() - 30)
      opts.lastModified = { $lt: dateThreshold }
    }
    return Record.findOne(opts).exec()
  },
  updateStateToPending (context, t) {
    const Record = context.db.model('Record')
    return Record.update({
      _id: t._id, state: t.state
    }, {
      $set: { state: "pending" },
      $currentDate: { lastModified: true }
    }).exec()
  },
  applyTransaction: async (context, t) => {
    const Book = context.db.model('Book')
    try {
      const book = await Book.findOne({isbn: t.isbn}).exec()
      return new Promise(async (resolve) => {
        // 如果pendingTransactions未记录record的_id，说明当前是在借书
        // console.log(`${book.title}:${book.pendingTransaction}:${t._id}`)
        if (book.pendingTransaction.indexOf(t._id) === -1) {
          if (book.canBorrow()) {
            await book.update({$inc: {count: -1}, $push: {pendingTransaction: t._id}}).exec()
            resolve('borrowed')
          } else {
            resolve('cancelled')
          }
        } else { // 如果pendingTransactions已经记录了record的_id，说明当前是在还书
          await book.update({$inc: {count: 1}, $pull: {pendingTransaction: t._id}}).exec()
          resolve('returned')
        }
      })
    } catch (e) {
      throw e
    }
  },
  updateStateToDone (context, t, done) {
    const Record = context.db.model('Record')
    const state = { state: done }
    const setAttrs = done === 'returned' ? { ...state, returnDate: Date.now() } : state
    const update = {
      $set: setAttrs,
      $currentDate: { lastModified: true }
    }
    return Record.update({ _id: t._id, state: "pending" }, update).exec()
  },
  recoverFromPending: async (context) => {
    try {
      let t = await Transaction.Books.retriveRecord(context, 'pending')
      while (t) {
        const done = await Books.applyTransaction(context, t)
        await Books.updateStateToDone(context, t, done)
        console.log(`Continue to finish Record: ${t._id}`)
        t = await Transaction.Books.retriveRecord(context, 'pending')
      }
    } catch (e) { }
  }
}
const Transaction = { Books }
export default Transaction