const Book = `
  scalar Date
  type SelectOptions {
    authors: [String!]
    translators: [String!]
    publishers: [String!]
  }
  type Book {
    id: ID! @unique
    isbn: String! @unique
    title: String!
    summary: String
    cover: String
    authors: [String!]!
    translators: [String!]
    publisher: String!
    version: Int
    pubDate: Date
    price: Float
    location: String
    volume: Int
    count: Int
    category: String
    scheduledCount: Int
  }
  input BookInput {
    isbn: String
    title: String
    summary: String
    cover: String
    authors: [String]
    translators: [String]
    publisher: String
    version: Int
    pubDate: Date
    price: Float
    location: String
    volume: Int
    count: Int
    category: String
  }
  type Category {
    id: ID @unique
    label: String!
    parent: Category
  }
  enum BugKeyword {
    COVER
    BOOK
    CUSTOM
  }
  enum BugStatus {
    NEW
    READ
    CONFIRMED
    RESOLVED
    REJECTED
  }
  enum BookState {
    BORROWED
    RETURNED
  }
  type BugReport {
    id: ID
    keyword: BugKeyword
    status: BugStatus
    createAt: Date
    description: String
    coverId: ID
    bookId: ID
    reporter: ID
  }
  input BugReportInput {
    keyword: BugKeyword!
    status: BugStatus!
    createAt: Date!
    description: String
    coverId: ID
    bookId: ID!
    reporter: ID
  }
  input BatchMappingInput {
    bookId: ID!
    coverId: ID!
  }
  type Record {
    id: ID!
    userId: ID!
    book: Book!
    state: String!
    date: Date!
    deadline: Date!
    returnDate: Date
    timeout: Boolean!
    canDelay: Boolean!
  }
  type Statistics {
    maxHoldCount: Int!
    readCount: Int!
    interests: [String!]
    recentRead: [Record!]
    credit: Float
  }
  input RecordsFilter {
    from: Date
    to: Date
    deadline: Int
    state: BookState
    userId: ID
    username: String
  }
  input BooksFilter {
    sortBy: String
    category: String
    authors: [String!]
    publisher: String
    count: Int,
    keyword: String
  }
 enum CoversFilter{
    SHOW_ALL
    SHOW_UNRELATED
    SHOW_BUGS
  }
  scalar Upload
  type File {
    id: ID!
    file: Upload
  }
  type CoverCount {
    total: Int!
    bugsCount: Int!
    unrelatedCount: Int!
  }
  type CoversPage {
    covers: [File]
    hasMore: Boolean
  }
  type Collection {
    id: ID!
    userId: ID!
    books: [Book!]
  }
  type BookComment {
    id: ID
    bookId: String
    userId: String
    title: String
    details: String
    score: Int
    postDate: Date
    thumbs: Int
  }
  type BookCommentProfile{
    count: Int
    average: Float
    max: Int
    group: [Star]
  }
  type Star{
    level: Int
    percent: Float
  }
  input BookCommentInput {
    bookId: String!
    userId: String!
    title: String!
    details: String!
    score: Int!
    postDate: Date
  }
  type BorrowPlan{
    expireAt: Date!
    books: [Book!]!
  }
  type MessageStatus{
    receiver: ID
    unread: Boolean
  }
  type Post{
    id: ID!
    postBy: ID
    message: String
    iat: Date
    sessionId: String
    status: [MessageStatus]
    messageType: String
    book: Book
  }
  type GroupedPost{
    iat: String
    posts: [Post]
  }
  type Feedback{
    id: ID
    category: String
    description: String
    postBy: String
    iat: Date
    status: String
  }
  enum FeedbackHandleStatus{
    ADOPTED
    REJECTED
    RESOLVED
  }
  enum FeedbackCategories{
    BUG
    ADVICE
  }
  enum ReserveKind{
    BORROW
    RETURN
  }
  type Plan{
    book: Book!
    timespan: [Date!]!
    process: Int!
  }
  input PlanInput{
    bookId: String!
    timespan: [Date!]!
  }
  type ReadPlan{
    id: ID!
    title: String!
    userId: String!
    plans: [Plan!]!
  }
  type Interest{
    category: String!
    percent: Float!
    count: Int!
  }
  type BookStatistics{
    book: Book!
    count: Int!
  }
`
module.exports = Book
