export const host = 'localhost'
export const database = 'library'
export const port = '27017'
// export const serverPort = '3000'
export const remoteSchemaUrl = 'http://localhost:4000/graphqlFileUpload'
export const remoteSchemaUrl2 = 'http://localhost:4001/graphqlUser'
export const localUrl = 'http://localhost:3000/graphql'
// export const REDIS_DOMAIN_NAME = 'localhost'
// export const REDIS_PORT_NUMBER = '6379'
// 每本书默认可以借30天
export const MAX_BORROW_DURATION = 30 * 24 * 3600 * 1000
// 每个人最多可同时借5本书
export const MAX_HOLD_BOOKS_COUNT = 5
// 可以续借的天数
export const MAX_DELAY_DAYS = 30 * 24 * 3600 * 1000
// 可以续借的次数
export const MAX_DELAY_TIMES = 1
// 根据计划还书日期查询借书记录时，如果仅指定了起始日期from,未指定结束日期to,那么默认查询从from日期开始，3天内到期的图书
export const DEFAULT_CHECK_DURATION = 3 * 24 * 3600 * 1000
// 返回最近读过的5本书
export const RECENT_READ_COUNT = 5
// 兴趣数量
export const INTEREST_CATEGORIES_COUNT = 3
export const emailAccount = 'wsj-88488111@163.com'
export const emailPassword = 'wsj3120682'