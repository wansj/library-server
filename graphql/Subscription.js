const Subscription = `
  type Subscription{
    postAdded(sessionId: ID!): Post
  }
`

module.exports = Subscription