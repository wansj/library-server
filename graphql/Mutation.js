const Mutation = `
  type Mutation{
    addBook(
      book: BookInput!
    ): Book
    batchAddBooks(
      books: [BookInput!]!
    ): [Book]
    updateBookByID(
      id: ID!
      book: BookInput!
    ): Book
    delBookById(id: ID!): Book
    addCategory(
      label: String!
      parent: ID
    ): Category
    updateCategory(
      id: ID!
      label: String!
      parent: ID
    ): Category
    removeCategory(id: ID!): Boolean
    addBugReport(
      bugReport: BugReportInput!
    ): BugReport
    updateBugStatus(id: ID!, status: BugStatus!): BugReport
    batchUpdateBookCover(maps: [BatchMappingInput!]!): Boolean!
    borrowBooks(userId: ID!, isbns: [String!]!): Boolean!
    returnBooks(userId: ID!, isbns: [String!]!): Boolean
    delayReturn(recordId: ID!): Boolean!
    delUnrelatedCovers: Boolean!
    addToCollection(userId: ID!, bookId: ID!): Boolean!
    delFromCollection(userId: ID!, bookIds: [ID!]!): Collection
    addBookComment(comment: BookCommentInput!): BookComment
    removeBookComment(id: ID!): BookComment
    thumbBookComment(id: ID!, userId: String!): BookComment
    unThumbBookComment(id: ID!, userId: String!): BookComment
    addToCart(userId: String!, bookId: String!): Boolean!
    removeFromCart(bookId: String!): Boolean!
    moveFromCartToCollection(bookId: String!): Boolean!
    addToSubscription(isbn: String!): Boolean!
    removeFromSubscription(isbn: String!): Boolean!
    addToBorrowPlan(bookIds: [String!]!, expireAt: Date!): Boolean!
    removeFromBorrowPlan(bookIds: [String!]!): Boolean!
    moveToCart(bookId: String!): Boolean!
    addPost(message: String!, messageType: String, sessionId: ID!): Post
    commitFeedback(category: FeedbackCategories!, description: String!): Boolean
    handleFeedback(id: ID!, status: FeedbackHandleStatus!, rejectReason: String): Boolean
    addToReturnPlan(bookIds: [String!]!, expireAt: Date!): Boolean!
    createReadPlan(plans: [PlanInput!]!, title: String!): ReadPlan!
    delReadPlan(id: ID!): Boolean!
  }
`

module.exports = Mutation
// createFriendship(friend: ID!, validateMessage: String!): Boolean