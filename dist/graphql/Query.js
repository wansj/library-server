"use strict";

var Query = "\n  type Query{\n    books(skip: Int!, limit: Int!): [Book!]!\n    booksFiltered(skip: Int!, limit: Int!, filter: BooksFilter): [Book!]!\n    book(id: ID!): Book!\n    bookByISBN(isbn: String!): Book\n    bookByCoverID(id: ID!): Book\n    booksHaveCover: [Book!]!\n    booksWithoutCover(skip: Int!, limit: Int!): [Book!]!\n    bookCount(filter: BooksFilter): Int!\n    selectOptions: SelectOptions\n    publishers(category: String!): [String!]\n    rootCategories: [Category!]!\n    childrenCategories(id: ID!): [Category!]!\n    childrenByPath(path: String!): [Category!]\n    categories: [Category!]!\n    hasChildCategories(id: ID!): Boolean\n    bugCovers: [BugReport!]!\n    buggy(id: ID!): BugReport\n    outdatedRecords(from: Date!, to: Date): [Record!]   \n    userStatistics(userId: ID!): Statistics!\n    records(skip: Int!, limit: Int!, filter: RecordsFilter): [Record!]\n    coversPage(page: Int!, size: Int!, filter: CoversFilter!): CoversPage\n    coversCount: CoverCount\n    collection(userId: ID!, skip: Int, limit: Int): [Book!]!\n    popularAuthors(category: String!): [String!]!\n    bookComment(id: ID!): BookComment\n    bookComments(skip: Int!, limit: Int!, bookId: String!): [BookComment!]!\n    bookCommentsProfile(bookId: String!): BookCommentProfile\n    bookCommentsByUser(skip: Int!, limit: Int!, userId: String!): [BookComment!]!\n    hasThumbed(id: ID!, userId: String!): BookComment\n    hasUserCommented(bookId: String!, userId: String!): Boolean\n    booksInCart: [Book!]!\n    cartCount: Int!\n    subsInCart: [Book]\n    booksInPlan(userId: String, kind: ReserveKind!): BorrowPlan\n    getSession(participators: [ID!]!): ID\n    posts(sessionId: ID!, skip: Int!, limit: Int!): [GroupedPost]\n    feedbacks(category: FeedbackCategories): [Feedback]\n    readPlans: [ReadPlan!]\n    interests: [Interest!]\n    mostBorrowed(skip: Int!, limit: Int!): [BookStatistics!]!\n    mostCollected(skip: Int!, limit: Int!): [BookStatistics!]!\n    mostRecommanded(skip: Int!, limit: Int!): [BookStatistics!]!\n  }\n";
module.exports = Query;
//# sourceMappingURL=Query.js.map