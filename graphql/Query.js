const Query = `
  type Query{
    books(skip: Int!, limit: Int!): [Book!]!
    booksFiltered(skip: Int!, limit: Int!, filter: BooksFilter): [Book!]!
    book(id: ID!): Book!
    bookByISBN(isbn: String!): Book
    bookByCoverID(id: ID!): Book
    booksHaveCover: [Book!]!
    booksWithoutCover(skip: Int!, limit: Int!): [Book!]!
    bookCount(filter: BooksFilter): Int!
    selectOptions: SelectOptions
    publishers(category: String!): [String!]
    rootCategories: [Category!]!
    childrenCategories(id: ID!): [Category!]!
    childrenByPath(path: String!): [Category!]
    categories: [Category!]!
    hasChildCategories(id: ID!): Boolean
    bugCovers: [BugReport!]!
    buggy(id: ID!): BugReport
    outdatedRecords(from: Date!, to: Date): [Record!]   
    userStatistics(userId: ID!): Statistics!
    records(skip: Int!, limit: Int!, filter: RecordsFilter): [Record!]
    coversPage(page: Int!, size: Int!, filter: CoversFilter!): CoversPage
    coversCount: CoverCount
    collection(userId: ID!, skip: Int, limit: Int): [Book!]!
    popularAuthors(category: String!): [String!]!
    bookComment(id: ID!): BookComment
    bookComments(skip: Int!, limit: Int!, bookId: String!): [BookComment!]!
    bookCommentsProfile(bookId: String!): BookCommentProfile
    bookCommentsByUser(skip: Int!, limit: Int!, userId: String!): [BookComment!]!
    hasThumbed(id: ID!, userId: String!): BookComment
    hasUserCommented(bookId: String!, userId: String!): Boolean
    booksInCart: [Book!]!
    cartCount: Int!
    subsInCart: [Book]
    booksInPlan(userId: String, kind: ReserveKind!): BorrowPlan
    getSession(participators: [ID!]!): ID
    posts(sessionId: ID!, skip: Int!, limit: Int!): [GroupedPost]
    feedbacks(category: FeedbackCategories): [Feedback]
    readPlans: [ReadPlan!]
    interests: [Interest!]
    mostBorrowed(skip: Int!, limit: Int!): [BookStatistics!]!
    mostCollected(skip: Int!, limit: Int!): [BookStatistics!]!
    mostRecommanded(skip: Int!, limit: Int!): [BookStatistics!]!
  }
`
module.exports = Query
