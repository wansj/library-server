/**
 * 对于Enum类型，如果不希望使用其name作为value,可以在resolver中以：
 * EnumTypeName: {
 *    key1: value1,
 *    key2: value2
 *        .
 *        .
 *        .
 * }这种形式来提供resolver。
 * 目前我所知的定义Enum的语法：enum ColorTypes { RED BLUE BLACK }只支持一维的Values([value1, value2...])，
 * 不支持二维的Values(例如[{key1: value1},{key2: value2}...])
 * https://www.apollographql.com/docs/graphql-tools/scalars.html中Internal Values有介绍Enum的用法
 **/
import { withFilter } from 'graphql-subscriptions'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import gql from 'graphql-tag'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import moment from 'moment'
import {
  MAX_BORROW_DURATION, DEFAULT_CHECK_DURATION, RECENT_READ_COUNT, INTEREST_CATEGORIES_COUNT,
  MAX_HOLD_BOOKS_COUNT
} from '../settings'
import Transaction from './transactions'
import {GetUserByIdQuery, GetUserByNamequery, BooksHaveCoverQuery, BugCoversQuery, CoversQuery, CoversPageQuery,
  CoversTotalQuery, DeleteCoverMutation, DeleteFilesMutation, GetBookByIDQuery, GetLogedUserIDQuery, AddFriendMutation} from './constants'
import { emailAccount, emailPassword } from '../settings'
import { fmtPostDate } from '../utils'

const getChildren = (categories, parent) => {
  let children = []
  categories.forEach((category) => {
    if (category.parent === parent) {
      children.push(category._id)
      children = children.concat(getChildren(categories, category._id))
    }
  })
  return children
}
moment.locale('zh-cn', {
  meridiem : function (hour, minute, isLowercase) {
    if (hour >= 2 && hour < 5) return '凌晨'
    else if (hour >= 5 && hour < 8) return '早晨'
    else if (hour >= 8 && hour < 12) return '上午'
    else if (hour >= 12 && hour < 14) return '中午'
    else if (hour >= 14 && hour < 18) return '下午'
    else if (hour >= 18 && hour < 22) return '晚上'
    else return '深夜'
  },
  weekdays : [
    "周日", "周一", "周二", "周三", "周四", "周五", "周六"
  ]
})
const pubsub = new RedisPubSub()
const POST_ADDED = 'postAdded'
// const FRIEND_ADDED = 'friendAdded'
const resolvers = {
    Date: new GraphQLScalarType({
      name: 'Date',
      description: 'Date custom scalar type',
      parseValue(value) {
        return new Date(value) // value from the client
      },
      serialize(value) {
        if (value instanceof Date)
          return value.getTime() // value sent to the client
        else
          return new Date(value).getTime()
      },
      parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
          return parseInt(ast.value, 10) // ast value is always in string format
        }
        return null
      }
    }),
    Upload: new GraphQLScalarType({
    name: 'Upload',
    description:
    'The `Upload` scalar type represents a file upload promise that resolves ' +
    'an object containing `stream`, `filename`, `mimetype` and `encoding`.',
    // value from the client
    parseValue(value) {
      return value
    },
    // ast value is always in string format
    parseLiteral(ast) {
      throw new Error('Upload scalar literal unsupported')
    },
    // value sent to the client
    serialize(value) {
      return value
      // return JSON.stringify(value)
    }
  }),
    File: {
      id (obj, args, context) {
        // console.log(obj)
        return obj.id
      },
      file (obj, args, context) {
        const { id, ...rest } = obj
        return rest
      }
    },
    Book: {
      id (obj, args, context) {
        return obj._id || obj.id
      },
      // 计算count时减去已预定的数量。
      scheduledCount (obj, args, context) {
        const Reserve = context.db.model('Reserve')
        return new Promise(async (resolve, reject) => {
          try {
            // 不能直接使用BorrowPlan.count({bookIds: obj._id})原因是obj._id是对象，不能简单的用eq来判断相等
            // 所以只好先用个pipeline把当前所有已预约的图书全选出来，然后再筛选判断当前图书是否在预约的图书中，判断的时候都转化为字符串再比较
            const aggregate = Reserve.aggregate().match({
              kind: 'BORROW',
              $expr: {
                $in: [{
                  $toString: obj._id
                }, {
                  $map: {
                    input: '$bookIds',
                    as: 'bookId',
                    in: {$toString: '$$bookId'}
                  }
                }]
              }
            }).unwind('$bookIds').group({
              _id: '$bookIds',
              count: {$sum: 1}
            })
            const result = await aggregate.exec()
            const [first] = result
            resolve(first ? first.count : 0)
          } catch (e) {
            reject(e)
          }
        })
      }
    },
    BugReport: {
      id (obj, args, context) {
        return obj._id
      }
    },
    Category: {
      id (obj, args, context) {
        return obj._id
      },
      parent (obj, args, context) {
        const Category = context.db.model('Category')
        return Category.findById(obj.parent).lean().exec()
      }
    },
    Record: {
      id (obj, args, context) {
        return obj._id
      },
      book (obj, args, context) {
        const Book = context.db.model('Book')
        return Book.findOne({isbn: obj.isbn}).exec()
      },
      timeout (obj, args, context) {
        return ( obj.returnDate || Date.now() ) > obj.deadline
      },
      canDelay (obj, args, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data:{user}} = await context.client.query({
              query: GetUserByIdQuery,
              variables: {id: obj.userId}
            })
            resolve(obj.delayTimes < user.role.maxDelayTimes)
          } catch (e) {
            reject(e)
          }
        })
      }
    },
    BookComment: {
      id (obj, args, context) {
        return obj._id
      },
      thumbs (obj, args, context) {
        return obj.useful.length
      }
    },
    Collection: {
      id (obj, args, context) {
        return obj._id
      },
      books (obj, args, context) {
        const bookIds = obj.bookIds
        return new Promise((resolve, reject) => {
          try {
            const books = bookIds.map(async (id) => {
              const {data: {book}} = await context.client.query({
                query: GetBookByIDQuery,
                variables: {id}
              })
              return book
            })
            resolve(books)
          } catch (e) {
            reject(e)
          }
        })
      }
    },
    Post: {
      id(obj, args, context, info) {
        return obj._id
      },
      book(obj, args, context) {
        if (obj.messageType === 'book') {
          const Book = context.db.model('Book')
          return Book.findById(obj.message).exec()
        } else {
          return null
        }
      }
    },
    Feedback: {
      id(obj, args, context, info) {
        return obj._id
      }
    },
    ReadPlan: {
      id(obj, args, context, info) {
        return obj._id
      }
    },
    Plan: {
      book(obj, args, context, info) {
        const Book = context.db.model('Book')
        return Book.findById(obj.bookId).exec()
      },
      process (obj, args, context, info) {
        return new Promise(async (resolve, reject) => {
          const Book = context.db.model('Book')
          try {
            const result = await Book.aggregate().match({_id: obj.bookId}).lookup({
              from: 'records',
              let: {isbn: '$isbn'},
              pipeline: [{
                $match: {
                  $expr: {
                    $and: [{
                      $eq: [{$toString: obj.userId}, '$userId']
                    }, {
                      $eq: ['$$isbn', '$isbn']
                    }]
                  }
                }
              }, {
                $project: {_id: 0, returnDate: 1}
              }],
              as: 'record'
            }).project({
              _id: 0,
              record: {$arrayElemAt: ['$record', 0]}
            }).exec()
            console.log(result)
            if (result.length === 0) resolve(0)
            else if (result[0].reocrd.returnDate) resolve(100)
            else {
              let [start, end] = timespan.map(date => moment(date))
              const total = end.diff(start, 'days')
              const process = moment().diff(start, 'days')
              if (process >= total) resolve(99)   // 如果逾期未读完，返回完成进度为99
              resolve(Math.round(process / total * 100))
            }
          } catch (e) {
            reject(e)
          }
        })

      }
    },
    Query: {
      books (obj, args, context, info) {
        const Book = context.db.model('Book')
        return Book.find({}).skip(args.skip).limit(args.limit).lean().exec()
      },
      book (obj, args, context, info) {
        const Book = context.db.model('Book')
        return Book.findById(args.id).lean().exec()
      },
      bookByISBN (obj, args, context, info) {
        const Book = context.db.model('Book')
        return Book.findOne({isbn: args.isbn}).lean().exec()
      },
      bookByCoverID (obj, { id }, context, info) {
        const Book = context.db.model('Book')
        return Book.findOne({cover: id}).lean().exec()
      },
      booksHaveCover (obj, args, context, info) {
        const Book = context.db.model('Book')
        return Book.where('cover').ne(null).lean().exec()
      },
      booksWithoutCover (obj, {skip, limit}, context, info) {
        const Book = context.db.model('Book')
        return Book.find({cover: null}).skip(skip).limit(limit).lean().exec()
      },
      booksFiltered (obj, {skip, limit, filter}, context, info) {
        const Book = context.db.model('Book')
        if (filter && filter.keyword) {
          return Book.find({$text: {$search: filter.keyword}}, {score: {$meta: "textScore"}})
            .sort( { score: { $meta: "textScore" } } ).skip(skip).limit(limit).exec()
        }
        let query = Book.find({})
        if (filter && filter.category) query = query.regex('category', new RegExp(`^${filter.category}`))
        if (filter && filter.publisher) query = query.where('publisher', filter.publisher)
        if (filter && filter.count) query = query.gte('count', filter.count)
        if (filter && filter.authors) query = query.in('authors', filter.authors)
        if (filter && filter.sortBy) query = query.sort({[filter.sortBy]: -1})
        return query.skip(skip).limit(limit).exec()
      },
      bookCount (obj, {filter}, context, info) {
        const Book = context.db.model('Book')
        let query = Book.find({})
        if (filter && filter.category) query = query.regex('category', new RegExp(`^${filter.category}`))
        if (filter && filter.publisher) query = query.where('publisher', filter.publisher)
        if (filter && filter.count) query = query.gte('count', filter.count)
        if (filter && filter.authors) query = query.in('authors', filter.authors)
        return query.count().exec()
      },
      selectOptions (obj, args, context, info) {
        const Book = context.db.model('Book')
        const p1 =  Book.distinct('authors').exec()
        const p2 = Book.distinct('translators').exec()
        const p3 = Book.distinct('publisher').exec()
        // Promise.all返回的结果是数组类型的，必须将其转化为对象类型再返回
        return Promise.all([p1, p2, p3]).then(([authors, translators, publishers]) => ({ authors, translators, publishers }))
      },
      publishers (obj, {category}, context) {
        const Book = context.db.model('Book')
        return Book.distinct('publisher', { category }).exec()
      },
      rootCategories (obj, args, context, info) {
        const Category = context.db.model('Category')
        // null可以匹配不存在，查找没有parent属性的Category就是根节点
        return Category.find({parent: null}).lean().exec()
      },
      childrenCategories (obj, { id }, context, info) {
        const Category = context.db.model('Category')
        return Category.find({parent: id}).lean().exec()
      },
      childrenByPath (obj, { path }, context, info) {
        const Category = context.db.model('Category')
        return new Promise(async (resolve, reject) => {
          try {
            const docs = await Category.aggregate([{
              $graphLookup: {
                from: "categories",
                startWith: "$parent",
                connectFromField: "parent",
                connectToField: "_id",
                as: "result"
              }
            }, {
              $project: {
                path: {
                  $concat: [{
                    $reduce: {
                      input: "$result",
                      initialValue: '',
                      in: {
                        $concat: ["$$value", {
                          $cond: [{$eq: ["$$value", '']}, '', '/']
                        }, "$$this.label"]
                      }
                    }
                  }, {
                    $cond: [{
                      $eq: [{ $size: "$result" }, 0]
                    }, "", "/"]
                  } , "$label"]
                }
              }
            }, {
              $match: {path: path}
            }]).exec()
            if (!docs || !docs.length) resolve([])
            const children = await Category.find({parent: docs[0]._id}).exec()
            resolve(children)
          } catch (e) {
            reject(e)
          }
        })
      },
      hasChildCategories (obj, { id }, context, info) {
        const Category = context.db.model('Category')
        return new Promise((resolve, reject) => {
          Category.count({parent: id}, function (err, count) {
            if (err) reject(err)
            else if (count > 0) resolve(true)
            else resolve(false)
          })
        })
      },
      categories (obj, args, context, info) {
        const Category = context.db.model('Category')
        return Category.find({}).lean().exec()
      },
      bugCovers (obj, args, context, info) {
        const BugReport = context.db.model('BugReport')
        return BugReport.find({keyword: 'COVER'}).nin('status', ['RESOLVED', 'REJECTED']).exec()
      },
      buggy (obj, { id }, context, info) {
        const BugReport = context.db.model('BugReport')
        return BugReport.find({}).or([{bookId: id}, {coverId: id}]).findOne().exec()
      },
      outdatedRecords (obj, args, context, info) {
        // 从给定起始日期往前推30天即为借书时间的下限
        const from = new Date(args.from.valueOf() - MAX_BORROW_DURATION)
        // 未提供to参数则从from参数往后推3天，即查询从from开始3天内到期的图书
        let to = args.to || new Date(args.from.valueOf() + DEFAULT_CHECK_DURATION)
        // 再从to的日期往前推30天得到借书时间的上限
        to = new Date(to.valueOf() - MAX_BORROW_DURATION)
        const Record = context.db.model('Record')
        return Record.find({state: 'BORROWED'}).where('date').gte(from).lte(to).exec()
      },
      records (obj, { skip, limit, filter }, context, info) {
        const Record = context.db.model('Record')
        let query = Record.find({})
        if (filter && filter.from) {
          query = query.gt('date', filter.from)
        }
        if (filter && filter.to) {
          query = query.lt('date', filter.to)
        }
        if (filter && filter.deadline) {
          const deadline = moment().add(filter.deadline, 'days').toDate()
          query = query.gt('deadline', Date.now()).lt('deadline', deadline)
        }
        if (filter && filter.state) {
          const state = filter.state === 'BORROWED' ? 'borrowed' : 'returned'
          query = query.where('state').equals(state)
        }
        return new Promise(async (resolve, reject) => {
          if (filter && filter.username) {
            try {
              const {data} = await context.client.query({
                query: GetUserByNamequery,
                variables: {username: filter.username}
              })
              query = query.where('userId').equals(data.userByName.id)
            } catch (e) { reject(e) }
          } else if (filter && filter.userId) {
            query = query.where('userId').equals(filter.userId)
          } else {
            // 如果不是管理员，则只能查询自己的记录
            const { data } = await context.client.query({ query: GetLogedUserIDQuery })
            if (data.logedUser && data.logedUser.role && !data.logedUser.role.isAdmin) {
              query = query.where('userId').equals(data.logedUser.id)
            }
          }
          try {
            const records = await query.sort('-lastModified').skip(skip).limit(limit).exec()
            resolve(records)
          } catch (e) { reject(e) }
        })
      },
      userStatistics (obj, { userId }, context, info) {
        const Record = context.db.model('Record')
        const Book = context.db.model('Book')
        return new Promise(async (resolve, reject) => {
          let maxHoldBooksCount = MAX_HOLD_BOOKS_COUNT
          try {
            const {data} = await context.client.query({
              query: GetUserByIdQuery,
              variables: { id: userId }
            })
            maxHoldBooksCount = data.user.role.maxHoldCount
          } catch (e) {
            reject(e)
          }
          Record.find({ userId, state: { $ne: 'cancelled' } }).sort('-date').exec(function (err, result) {
            if (err) reject(err)
            else if(result.length > 0) {
              // res和result是一个读者的所有借书记录（含对同一本书的重复借阅）
              const res = result.map(document => document.toObject({ virtuals: true }))
              // 当前已借的图书
              const borrowed = res.filter(doc => doc.state === 'borrowed')
              // 当前可借书的数量为最大可借书数减去已借书（尚未归还）的数
              const maxHoldCount = maxHoldBooksCount - borrowed.length
              // 未逾期还书的次数
              const num = res.filter(doc => !doc.timeout).length
              // 计算信用分数（应以所有借书次数和逾期次数为准），最高5分,保留1位小数
              const credit = new Number(num / res.length * 5).toFixed(1)
              // 相同的图书只保留最近一次的记录
              const set = new Set() // 利用Set不重复性来过滤重复图书
              const docs = res.filter(doc => {
                if (!set.has(doc.isbn)) {
                  set.add(doc.isbn)
                  return true
                } else {
                  return false
                }
              })
              // 读过的书的总数
              const readCount = docs.length
              // 只取前5条记录
              const recentRead = docs.slice(0, RECENT_READ_COUNT)
              const isbns = docs.map(doc => doc.isbn)
              // 先根据isbn匹配图书,然后根据category分组并计数，此时返回结果格式为：{_id: '分类1',count: 10}
              // 根据计数结果倒序排序，并只取前3个结果
              Book.aggregate([{ $match: { isbn: { $in: isbns } } }])
                .group({ _id: '$category', count: { $sum: 1 } })
                .sort('-count').limit(INTEREST_CATEGORIES_COUNT)
                .exec(function (err, res) {
                  if (err) reject(err)
                  else {
                    const interests = res.map(doc => doc._id) || []
                    resolve({ maxHoldCount,readCount, credit, recentRead, interests })
                  }
                })
            } else {
              resolve({ maxHoldCount: maxHoldBooksCount, readCount: 0, credit: 0, recentRead: [], interests: [] })
            }
          })
        })
      },
      coversPage (obj, {page, size, filter}, context, info) {
        return new Promise(async (resolve, reject) => {
          try {
            let query = {tag: 'BOOK'}
            switch (filter) {
              case 'SHOW_UNRELATED':
                const {data: {booksHaveCover}} = await context.client.query({
                  query: BooksHaveCoverQuery,
                  fetchPolicy: 'network-only'
                })
                const covers = booksHaveCover.map(({cover}) => cover)
                console.log(covers.length)
                query['_id'] = {$nin: covers}
                break
              case 'SHOW_BUGS':
                const {data: {bugCovers}} = await context.client.query({query: BugCoversQuery, fetchPolicy: 'network-only'})
                const coversIDs = bugCovers.map(({coverId}) => coverId)
                query['_id'] = {'$in': coversIDs}
                break
            }
            query = JSON.stringify(query)
            const {data: {covers}} = await context.client.query({query: CoversQuery, variables: {page, size, query}})
            resolve({covers, hasMore: covers.length === size})
          } catch (e) {
            reject(e)
          }
        })
      },
      coversCount (obj, args, context, info) {
        async function count (filter, size) {
          const {data: {coversPage}} = await context.client.query({query: CoversPageQuery, variables: {filter, size, page: 0}})
          return coversPage.covers.length
        }
        return new Promise(async (resolve, reject) => {
          try {
            const {data: {coversTotal}} = await context.client.query({query: CoversTotalQuery, variables: {query: JSON.stringify({tag: 'BOOK'})}})
            const p1 = count('SHOW_UNRELATED', coversTotal)
            const p2 = count('SHOW_BUGS', coversTotal)
            const [unrelatedCount, bugsCount] = await Promise.all([p1, p2])
            resolve({unrelatedCount, bugsCount, total: coversTotal})
          } catch (e) {
            reject(e)
          }
        })
      },
      collection (obj, { userId, skip, limit }, context, info) {
        return new Promise(async (resolve, reject) => {
          try {
            const Collection = context.db.model('Collection')
            let aggregate = Collection.aggregate().match({userId}).unwind('books').lookup({
              from: 'books',
              let: {bookId: '$books.id'},
              pipeline: [{
                $match: {
                  $expr: {
                    $eq: [{$toString: '$_id'}, '$$bookId']
                  }
                }
              }],
              as: 'book'
            })
            // aggregate.exec(function (err, doc) {
            //   console.log(doc)
            // })
            aggregate = aggregate.group({
              _id: null,
              collectedBooks: {
                $push: {$mergeObjects: [{$arrayElemAt: ['$book', 0]}, {iat: '$books.iat'}]}
              }
            })
            const result = await aggregate.exec()
            if (!result[0]) resolve([])
            else {
              const books = [...result[0].collectedBooks]
              const end = limit > 0 ? (limit + skip) : books.length
              const sliced = books.sort((a, b) => a.iat < b.iat).slice(skip, end)
              resolve(sliced)
            }
          } catch (e) {
            reject(e)
          }
        })

        if (typeof skip === 'number') query = query.skip(skip)
        if (typeof limit === 'number') query = query.limit(limit)
        return query.exec()
      },
      popularAuthors (obj, {category}, context) {
        const Book = context.db.model('Book')
        return new Promise(async (resolve, reject) => {
          try {
            const authors = await Book.aggregate().match({ category }).unwind('authors')
              .group({ _id: '$authors', count: { $sum: 1 } }).sort('-count').limit(7).exec()
            // console.log(authors)
            resolve(authors.map(({ _id }) => _id))
          } catch (e) {
            reject(e)
          }
        })
      },
      bookComment (obj, {id}, context) {
        const BookComment = context.db.model('BookComment')
        return BookComment.findById(id).exec()
      },
      // 热门评论的计算方法：先根据认为评论有用的用户数倒序排列，再根据评论日期倒序排列
      bookComments (obj, {skip, limit, bookId}, context) {
        const BookComment = context.db.model('BookComment')
        return new Promise(async (resolve, reject) => {
          try {
            const result = await BookComment.aggregate([{
              $match: {bookId}
            }, {
              $project: {
                bookId: 1,
                userId: 1,
                details: 1,
                title: 1,
                score: 1,
                postDate: 1,
                useful: 1,
                count: {
                  $size: "$useful"
                }
              }
            }, {
              $sort: {count: -1, postDate: -1}
            }]).skip(skip).limit(limit).exec()
            // console.log(result)
            resolve(result)
          } catch (e) {
            reject(e)
          }
        })
      },
      bookCommentsByUser (obj, {skip, limit, userId}, context) {
        const BookComment = context.db.model('BookComment')
        return BookComment.find({userId}).sort('-postDate').skip(skip).limit(limit).exec()
      },
      bookCommentsProfile (obj, {bookId}, context) {
        const BookComment = context.db.model('BookComment')
        let aggregate = BookComment.aggregate()
        // 根据bookId匹配该书的所有评论
        aggregate = aggregate.match({ bookId })
        // 按评分分组，分组完之后的结果数组应该最多只有5个元素，分别对应1、2、3、4、5颗星，groupCount代表的是对应评分的人数
        aggregate = aggregate.group({
          _id: "$score",
          groupCount: { $sum: 1 }
        })
        // 按null分组可以计算总的评分人数，即把各组人数相加；最大评分，即分组键_id的最大值；总分值，即每个评分等级乘以对应的人数再求和，总分值是为了下一步求平均分做准备的，因为$divide和$multiply这些操作符
        // 不属于累加操作符，不能直接作为group下的根操作；最关键的，是将各评分等级和相应人数记录下来，即记到group数组中，以便于下一步的时候求各评分等级所占比重
        aggregate = aggregate.group({
          _id: null,
          max: { $max: "$_id" },
          count: { $sum: "$groupCount" },
          totalScore: { $sum: { $multiply: ["$groupCount", "$_id"] } },
          group: {
            $push:
              {
                level: "$_id",
                groupCount: "$groupCount"
              }
          }
        })
        // 在上一步的基础上，进行映射project操作：_id字段就不要了；max和count字段直接保留就行；增加average字段，用上一步算好的总分值除以总人数即可；group字段要使用$map操作符进行映射，对于每一个group对象,
        // level字段直接原样输出，percent字段拿groupCount除以总count即得出所占比例
        aggregate = aggregate.project({
          _id: 0,
          max: 1,
          count: 1,
          group: {
            $map: {
              input: "$group",
              as: "group",
              in: {
                level: "$$group.level",
                percent: {
                  $divide: ["$$group.groupCount", "$count"]
                }
              }
            }
          },
          average: { $divide: ["$totalScore", "$count"] }
        })
        return new Promise(async (resolve, reject) => {
          try {
            const res = await aggregate.exec()
            // 最后要记住，aggregate返回的结果一直都是数组，即使只有1个元素，所以直接返回数组第一个元素即可
            resolve(res[0])
          } catch (e) {
            reject(e)
          }
        })
      },
      hasThumbed (obj, {id, userId}, context) {
        const BookComment = context.db.model('BookComment')
        return BookComment.findById(id).in('useful', userId).exec()
      },
      hasUserCommented (obj, {userId, bookId}, context) {
        const BookComment = context.db.model('BookComment')
        return new Promise(async (resolve, reject) => {
          try {
            const comment = await BookComment.findOne({userId, bookId}).exec()
            resolve(!!comment)
          } catch (e) {
            reject(e)
          }
        })
      },
      cartCount (obj, args, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const Cart = context.db.model('Cart')
            const cart = await Cart.findOne({userId: data.logedUser.id}).exec()
            if (cart) {
              resolve(cart.get('bookIds').length)
            }
            resolve(0)
          } catch (e) {
            reject(e)
          }
        })
      },
      booksInCart (obj, args, context) {
        const Cart = context.db.model('Cart')
        const Book = context.db.model('Book')
        return new Promise(async (resolve, reject) => {
          try {
            const { data } = await context.client.query({ query: GetLogedUserIDQuery })
            if (!data.logedUser) throw new Error('用户未登录')
            const result = await Cart.aggregate().match({userId: data.logedUser.id}).unwind('bookIds').lookup({
              from: 'books',
              localField: 'bookIds',
              foreignField: '_id',
              as: 'book'
            }).group({
              _id: null,
              books: {
                $push: {
                  $arrayElemAt: ['$book', 0]
                }
              }
            })
            const [first] = result
            resolve(first ? first.books : [])
          } catch (e) {
            reject(e)
          }
        })
      },
      subsInCart (obj, args, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const Cart = context.db.model('Cart')
            const result = await Cart.aggregate().match({userId: data.logedUser.id}).unwind('subscriptions').lookup({
              from: 'books',
              localField: 'subscriptions',
              foreignField: 'isbn',
              as: 'book'
            }).group({
              _id: null,
              books: {
                $push: {
                  $arrayElemAt: ['$book', 0]
                }
              }
            }).exec()
            if (result[0]) resolve(result[0].books)
            else resolve([])
          } catch (e) {
            reject(e)
          }
        })
      },
      booksInPlan (obj, { userId, kind }, context) {
        return new Promise(async (resolve, reject) => {
          try {
            let id = userId
            if (!id) {
              const {data} = await context.client.query({query: GetLogedUserIDQuery})
              id = data.logedUser.id
            }
            const Reserve = context.db.model('Reserve')
            const results = await Reserve.aggregate().match({ userId: id, kind }).unwind('bookIds').lookup({
              from: 'books',
              localField: 'bookIds',
              foreignField: '_id',
              as: 'book'
            }).group({
              _id: null,
              expireAt: {
                $push: "$expireAt"
              },
              books: {
                $push: {
                  $arrayElemAt: ['$book', 0]
                }
              }
            }).project({
              _id: 0,
              books: 1,
              expireAt: { $arrayElemAt: ['$expireAt', 0] }
            })
            resolve(results[0])
          } catch (e) {
            reject(e)
          }
        })

      },
      getSession (obj, {participators}, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const queries = participators.map(userId => ({participators: userId}))
            queries.push({participators: data.logedUser.id})
            const len = queries.length
            const Conversation = context.db.model('Conversation')
            const result = await Conversation.aggregate().match({$and: queries}).project({
              _id: 0,
              id: {
                $cond: [{
                  $eq: [{$size: '$participators'}, len]
                }, '$_id', null]
              }
            }).exec()
            // console.log(result)
            const item = result.filter(({id}) => !!id)[0]
            if (item) resolve(item.id)
            else {
              const conversation = await new Conversation({participators: [...participators, data.logedUser.id]}).save()
              resolve(conversation.id)
            }
          } catch (e) {
            reject(e)
          }
        })
      },
      posts (obj, {sessionId, skip, limit}, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const Post = context.db.model('Post')
            // 按日期降序排列，筛选limit条记录，按照年、月、日、小时、分钟相同的进行分组，即每分钟的信息编成1组
            let aggregate = Post.aggregate().match({sessionId}).sort('-iat').skip(skip).limit(limit).group({
              _id: {
                year: {$toString: {$year: {date: '$iat'}}}, // 四位年份（字符串）
                month: {$dateToString: {date: '$iat', format: '%m'}}, // 2位月份，前面补0（字符串）
                day: {$dateToString: {date: '$iat', format: '%d'}}, // 2位日期，前面补0（字符串）
                hour: {$dateToString: {date: '$iat', format: '%H'}}, // 2位小时，前面补0，（字符串）
                minute: {$dateToString: {date: '$iat', format: '%M'}} // 2位分钟，前面补0，（字符串）
              },
              posts: {
                $push: {
                  _id: '$_id',
                  postBy: '$postBy',
                  message: '$message',
                  messageType: '$messageType',
                  status: '$status',
                  iat: '$iat',
                  sessionId: '$sessionId'
                }
              }
            })
            // 把group的_id重新还原位日期格式，便于后面使用moment进行格式化
            aggregate = aggregate.project({
              _id: 0,
              posts: 1,
              issueAt: {
                $dateFromString: {
                  dateString: {
                    $concat: ['$_id.year', '-', '$_id.month', '-', '$_id.day', 'T', '$_id.hour', ':', '$_id.minute', ':00.000Z']
                  }
                }
              }
            }).sort('issueAt')
            const posts = await aggregate.exec()
            const result = posts.map(({posts, issueAt}) => {
              posts.sort((a, b) => a.iat > b.iat)
              return { posts, iat: fmtPostDate(issueAt) }
            })
            resolve(result)
          } catch (e) {
            reject(e)
          }
        })
      },
      feedbacks (obj, args, context) {
        const Feedback = context.db.model('Feedback')
        return new Promise(async (resolve, reject) => {
          const {data} = await context.client.query({query: GetLogedUserIDQuery})
          if (!data.logedUser) throw new Error('用户未登录')
          if (!data.logedUser.role.isAdmin) throw new Error('没有权限查看')
          let query = Feedback.find({})
          const { category } = args
          if (category) query = query.find({category})
          try {
            resolve(await query.exec())
          } catch (e) {
            reject(e)
          }
        })
      },
      readPlans (obj, args, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const ReadPlan = context.db.model('ReadPlan')
            const readPlans = await ReadPlan.find({userId: data.logedUser.id}).sort('-createAt').exec()
            resolve(readPlans)
          } catch (e) {
            reject(e)
          }
        })
      },
      interests (obj, args, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) resolve(null)
            const Record = context.db.model('Record')
            let result = await Record.aggregate().match({userId: data.logedUser.id, state: {$ne: 'cancelled'}}).lookup({
              from: 'books',
              localField: 'isbn',
              foreignField: 'isbn',
              as: 'book'
            }).project({
              _id: 0,
              category: {$arrayElemAt: ['$book.category', 0]}
            }).group({
              _id: '$category',
              count: {$sum: 1}
            }).sort('-count').project({
              category: '$_id',
              count: 1
            }).exec()
            const total = result.reduce((memo, {count}) => {
              memo = memo + count
              return memo
            }, 0)
            result = result.map(({category, count}) => ({count, category: category.split('/').pop(), percent: Number(Number(count/total*100).toFixed(2))}))
            console.log(result)
            if (result.length > 5) {
              result = result.slice(0, 5)
              const props = result.slice(5).reduce((memo, {count, percent}) => {
                memo.percent = memo.percent + percent
                memo.count = memo.count + count
                return memo
              }, {percent: 0, count: 0})
              result.push({...props, category: '其它'})
            }
            resolve(result)
          } catch (e) {
            reject(e)
          }
        })
      },
      mostBorrowed (obj, {skip, limit}, context) {
        const Record = context.db.model('Record')
        return new Promise(async (resolve, reject) => {
          try {
            const result = await Record.aggregate().group({
              _id: '$isbn',
              count: {$sum: 1}
            }).sort('-count').skip(skip).limit(limit).lookup({
              from: 'books',
              localField: '_id',
              foreignField: 'isbn',
              as: 'book'
            }).project({
              _id: 0,
              count: 1,
              book: {$arrayElemAt: ['$book', 0]}
            }).exec()
            console.log(result)
            resolve(result)
          } catch (e) {
            reject(e)
          }
        })
      },
      mostCollected (obj, {skip, limit}, context) {
        const Collection = context.db.model('Collection')
        return new Promise(async (resolve, reject) => {
          try {
            const result = await Collection.aggregate().unwind('books').group({
              _id: '$books.id',
              count: {$sum: 1}
            }).sort('-count').skip(skip).limit(limit).lookup({
              from: 'books',
              let: {bookId: '$_id'},
              pipeline: [{
                $match: {
                  $expr: {
                    $eq: ['$$bookId', {$toString: '$_id'}]
                  }
                }
              }],
              as: 'book'
            }).project({
              _id: 0,
              count: 1,
              book: {$arrayElemAt: ['$book', 0]}
            }).exec()
            console.log(result)
            resolve(result)
          } catch (e) {
            reject(e)
          }
        })
      },
      mostRecommanded (obj, {skip, limit}, context) {
        return new Promise(async (resolve, reject) => {
          const Post = context.db.model('Post')
          try {
            const result = await Post.aggregate().match({
              messageType: 'book'
            }).group({
              _id: '$message',
              count: {$sum: 1}
            }).sort('-count').skip(skip).limit(limit).lookup({
              from: 'books',
              let: {bookId: '$_id'},
              pipeline: [{
                $match: {
                  $expr: {
                    $eq: ['$$bookId', {$toString: '$_id'}]
                  }
                }
              }],
              as: 'book'
            }).project({
              _id: 0,
              count: 1,
              book: {$arrayElemAt: ['$book', 0]}
            }).exec()
            console.log(result)
            resolve(result)
          } catch (e) {
            reject(e)
          }
        })
      }
    },
    Mutation: {
      batchAddBooks (obj, { books }, context, info) {
        const Book = context.db.model('Book')
        return new Promise((resolve, reject) => {
          // 查询所有图书的isbn，isbn已经存在的不再写入数据库，避免duplicated key error
          Book.find({}, {lean: true, select: 'isbn'}, function (err, docs) {
            if (err) reject(err)
            const isbns = docs.map(doc => doc.isbn)
            const filteredBooks = books.filter(book => isbns.indexOf(book.isbn) === -1)
            Book.insertMany(filteredBooks, {ordered: false}, function (error, docs) {
              if (error) reject(error)
              resolve(docs)
            })
          })
        })
      },
      addBook (obj, args, context, info) {
        const Book = context.db.model('Book')
        const book = new Book(args.book)
        return new Promise((resolve, reject) => {
          book.save({lean: true}, (err, bookAdded) => {
            if (err) reject(err)
            else {
              resolve(bookAdded)
            }
          })
        })
      },
      updateBookByID (obj, args, context, info) {
        const Book = context.db.model('Book')
        const { id, book } = args
        return new Promise((resolve, reject) => {
          Book.findById(id).exec((err, doc) => {
            if (err) reject(err)
            else {
              // 如果更新了cover的话，要将原来cover对应的图片文件从数据库中删除，以避免产生垃圾
              if (book.cover && doc.get('cover')) {
                const p1 = context.client.mutate({
                  mutation: gql`
                    mutation DeleteCoverMutation($id: ID!) {
                      delFileByID(id: $id) {
                        id
                      }
                    }
                  `,
                  variables: { id: doc.get('cover') }
                })
                doc.set(book)
                const p2 = doc.save()
                Promise.all([p1, p2]).then(([id, book]) => resolve(book)).catch(err => reject(err))
              } else {
                doc.set(book)
                doc.save().then(book => resolve(book)).catch(err => reject(err))
              }
            }
          })
        })
      },
      batchUpdateBookCover (obj, { maps }, context, info) {
        const Book = context.db.model('Book')
        const bulkWriteOperations = maps.map(({bookId, coverId}) => ({
          updateOne: {
            filter: { '_id': bookId },
            update: { 'cover': coverId }
          }
        }))
        return new Promise((resolve, reject) => {
          Book.bulkWrite(bulkWriteOperations, { ordered: false }, function (err, bulkOpResult) {
            if (err) reject(err)
            else {
              resolve(true)
            }
          })
        })
      },
      delBookById (obj, { id }, context, info) {
        const Book = context.db.model('Book')
        return new Promise((resolve, reject) => {
          Book.findByIdAndRemove(id, { lean: true }, (err, bookDeleted) => {
            if (err) reject(err)
            else {
              context.client.mutate({
                mutation: DeleteCoverMutation,
                variables: { id: bookDeleted.cover }
              }).then(data => {
                resolve(bookDeleted)
              }).catch(err => reject(err))
            }
          })
        })
      },
      addCategory (obj, args, context, info) {
        const Category = context.db.model('Category')
        const category = new Category(args)
        return new Promise((resolve, reject) => {
          category.save({lean: true}, function (err, categoryAdded) {
            if (err) reject(err)
            else {
              resolve(categoryAdded)
            }
          })
        })
      },
      updateCategory (obj, args , context, info) {
        const Category = context.db.model('Category')
        const { id, ...update } = args
        return Category.findByIdAndUpdate(id, update, {new: true}).lean().exec()
      },
      // 删除分类时，同步将所有子类一起删除
      removeCategory (obj, { id }, context, info) {
        const Category = context.db.model('Category')
        return new Promise((resolve, reject) => {
          Category.find({}, 'parent', {lean: true}, function (err, categories) {
            if (err) reject(err)
            const delIDs = getChildren(categories, id).concat(id)
            console.log(delIDs)
            Category.deleteMany({"_id": {"$in": delIDs}}, function (err) {
              if (err) reject(err)
              else {
                resolve(true)
              }
            })
          })
        })
      },
      addBugReport (obj, {bugReport}, context, info) {
        const BugReport = context.db.model('BugReport')
        return new BugReport(bugReport).save()
      },
      updateBugStatus(obj, {id, status}, context, info) {
        const BugReport = context.db.model('BugReport')
        return BugReport.findByIdAndUpdate(id, {status}, {new: true}).exec()
      },
      
      //如果出现数据一致性问题，比如一本书数量减少了1本，但是在更新state为applied时发生了错误，由定时器进行检查并回滚
      borrowBooks (obj, { userId, isbns } , context, info) {
        const Record = context.db.model('Record')
        const promise = context.client.query({query: GetUserByIdQuery, variables: {id: userId}})
        return promise.then(({data: {user}}) => {
          const deadline = moment().add(user.role.maxBorrowDuration, 'days').toDate()
          const records = isbns.map(isbn => ({
            userId,
            isbn,
            deadline,
            state: 'initial'
          }))
          const defer = Record.insertMany(records, { ordered: false })
          return defer.then(() => {
            const promises = isbns.map((isbn) => Transaction.Books.startTransaction(context, isbn, 'initial', userId))
            return Promise.all(promises)
          })
        })
      },
      returnBooks (obj, { userId, isbns }, context, info) {
        const promises = isbns.map((isbn) => Transaction.Books.startTransaction(context, isbn, 'borrowed', userId))
        return new Promise(async (resolve, reject) => {
          try {
            const result = await Promise.all(promises)
            const Cart = context.db.model('Cart')
            resolve(result)
          } catch (e) {
            reject(e)
          }
        })
      },
      delayReturn (obj, { recordId }, context, info) {
        const Record = context.db.model('Record')
        return new Promise(async (resolve, reject) => {
          try {
            const record = await Record.findById(recordId).exec()
            const {data: {user}} = await context.client.query({query: GetUserByIdQuery, variables: {id: record.userId}})
            if (record.delayTimes < user.role.maxDelayTimes) {
              record.delayTimes = record.delayTimes + 1
              record.deadline = moment(record.deadline).add(user.role.maxDelayDays, 'days')
              await record.save()
              resolve(true)
            } else reject(new Error('已经达到最大续借过次数'))
          } catch (e) {
            reject(e)
          }
        })
      },
      delUnrelatedCovers (obj, args, context, info) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data: {booksHaveCover}} = await context.client.query({query: BooksHaveCoverQuery})
            const covers = booksHaveCover.map(({cover}) => cover)
            const query = JSON.stringify({_id: {$nin: covers}})
            await context.client.mutate({mutation: DeleteFilesMutation, variables: {query}})
            resolve(true)
          } catch (e) {
            reject(e)
          }
        })
      },
      addToCollection (obj, { userId, bookId }, context, info) {
        const Collection = context.db.model('Collection')
        return new Promise(async (resolve, reject) => {
          try {
            const col = await Collection.findOne({userId}).exec()
            if (col) {
              if (col.books.findIndex(({id}) => id === bookId) === -1) {
                const books = [...col.books, {id: bookId, iat: new Date()}]
                col.set('books', books)
                await col.save()
                resolve(true)
              } else {
                resolve(false)
              }
            } else {
              await new Collection({userId, books: [{id: bookId, iat: new Date()}]}).save()
              resolve(true)
            }
          } catch (e) {
            reject(e)
          }
        })
      },
      delFromCollection (obj, { userId, bookIds }, context, info) {
        const Collection = context.db.model('Collection')
        return Collection.findOneAndUpdate({ userId }, { $pull: { books: { id: {$each: bookIds} } } }, { new: true }).exec()
      },
      addBookComment (obj, {comment}, context) {
        const BookComment = context.db.model('BookComment')
        return new BookComment(comment).save()
      },
      removeBookComment (obj, {id}, context) {
        const BookComment = context.db.model('BookComment')
        return BookComment.findByIdAndRemove(id).exec()
      },
      thumbBookComment (obj, {id, userId}, context) {
        const BookComment = context.db.model('BookComment')
        return BookComment.findOneAndUpdate({_id: id, userId: {$ne: userId}}, {$addToSet: {useful: userId}}).exec()
      },
      unThumbBookComment (obj, {id, userId}, context) {
        const BookComment = context.db.model('BookComment')
        return BookComment.findByIdAndUpdate(id, {$pull: {useful: userId}}).exec()
      },
      addToCart (obj, { userId, bookId }, context) {
        const Cart = context.db.model('Cart')
        return new Promise(async (resolve, reject) => {
          try {
            const result = await Cart.update({userId}, {$addToSet: {bookIds: bookId}}, {upsert: true}).exec()
            // console.log(result)
            resolve(!!result.nModified)
          } catch (e) {
            reject(e)
          }
        })
      },
      removeFromCart (obj, { bookId }, context) {
        const Cart = context.db.model('Cart')
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const result = await Cart.update({userId: data.logedUser.id}, {$pull: {bookIds: bookId}}).exec()
            resolve(!!result.nModified)
          } catch (e) {
            reject(e)
          }
        })
      },
      moveFromCartToCollection (obj, { bookId }, context) {
        const Cart = context.db.model('Cart')
        const Collection = context.db.model('Collection')
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const collection = await Collection.update({userId: data.logedUser.id, '$expr': {$not: {$in: [bookId, '$books.id']}}}, {$push: {books: {id: bookId, iat: new Date()}}}, { upsert: true })
            const cart = await Cart.update({userId: data.logedUser.id}, {$pull: {bookIds: bookId}}).exec()
            resolve(!!cart.nModified)
          } catch (e) {
            reject(e)
          }
        })
      },
      addToSubscription (obj, { isbn }, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const Cart = context.db.model('Cart')
            const result = await Cart.update({userId: data.logedUser.id}, {$addToSet: {subscriptions: isbn}}, {upsert: true}).exec()
            resolve(!!result.nModified)
          } catch (e) {
            reject(e)
          }
        })
      },
      removeFromSubscription (obj, { isbn }, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const Cart = context.db.model('Cart')
            const result = await Cart.update({userId: data.logedUser.id}, {$pull: {subscriptions: isbn}}).exec()
            resolve(!!result.nModified)
          } catch (e) {
            reject(e)
          }
        })
      },
      addToBorrowPlan (obj, {bookIds, expireAt}, context) {
        const Reserve = context.db.model('Reserve')
        const Cart = context.db.model('Cart')
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            let maxHoldCount = data.logedUser.statistics.maxHoldCount // 当前用户最多可借书的数量
            const borrowPlan = await Reserve.findOne({userId: data.logedUser.id}).exec()
            maxHoldCount = maxHoldCount - borrowPlan.bookIds.length // 减去当前已预约的书的数量
            if (bookIds.length > maxHoldCount) throw new Error(`您当前最多只能预约${maxHoldCount}本书`)
            const plan = await Reserve.update({userId: data.logedUser.id, kind: 'BORROW'}, {expireAt, $addToSet: {bookIds: {$each: bookIds}}}, {upsert: true}).exec()
            if (!plan.nModified) throw new Error('已经预约过了')
            const result = await Cart.update({userId: data.logedUser.id}, {$pull: { bookIds: { $in: bookIds } }}).exec()
            // console.log(plan.nModified)
            resolve(!!result.nModified)
          } catch (e) {
            reject(e)
          }
        })
      },
      removeFromBorrowPlan (obj, {bookIds}, context) {
        const Reserve = context.db.model('Reserve')
        return new Promise(async (resolve, reject) => {
          const {data} = await context.client.query({query: GetLogedUserIDQuery})
          if (!data.logedUser) throw new Error('用户未登录')
          const result = await Reserve.update({userId: data.logedUser.id, kind: 'BORROW'}, {$pull: { bookIds: { $in: bookIds } }}).exec()
          // console.log(result)
          resolve(!!result.nModified)
        })
      },
      moveToCart (obj, {bookId}, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const userId = data.logedUser.id
            const Reserve = context.db.model('Reserve')
            const result = await Reserve.update({userId, kind: 'BORROW'}, {$pull: {bookIds: bookId}}).exec()
            if (!result.nModified) throw new Error('从预约中删除失败')
            const Cart = context.db.model('Cart')
            const res = await Cart.update({userId}, {$addToSet: {bookIds: bookId}}, {upsert: true}).exec()
            if (!res.nModified) throw new Error('向书单中添加失败')
            resolve(true)
          } catch (e) {
            reject(e)
          }
        })
      },
      addPost (obj, {message, messageType, sessionId}, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const Conversation = context.db.model('Conversation')
            const {participators} = await Conversation.findById(sessionId, 'participators').exec()
            // console.log(participators.length)
            const status = participators.filter(userId => userId !== data.logedUser.id).map(id => ({receiver: id, unread: true}))
            const post = {
              message,
              sessionId,
              status,
              messageType:  messageType || 'text',
              iat: new Date(),
              postBy: data.logedUser.id
            }
            const Post = context.db.model('Post')
            const postAdded = await new Post(post).save()
            // 在publish之前必须对Date进行序列化，因为publish的数据是不会通过Date的resolver进行序列化的
            // let obj = postAdded.toObject()
            // obj = {...obj, iat: obj.iat.getTime(), id: obj._id}
            // console.log(obj)
            pubsub.publish(POST_ADDED, {postAdded})
            resolve(postAdded)
          } catch (e) {
            reject(e)
          }
        })
      },
      commitFeedback (obj, {category, description}, context) {
        const Feedback = context.db.model('Feedback')
        return new Promise(async (resolve, reject) => {
          const {data} = await context.client.query({query: GetLogedUserIDQuery})
          if (!data.logedUser) throw new Error('用户未登录')
          try {
            const feedback = await new Feedback({
              category,
              description,
              postBy: data.logedUser.id,
              iat: new Date(),
              status: 'UNREAD'
            }).save()
            resolve(true)
          } catch (e) {
            reject(e)
          }
        })
      },
      handleFeedback (obj, {id, status, rejectReason}, context) {
        const Feedback = context.db.model('Feedback')
        return new Promise(async (resolve, reject) => {
          const {data} = await context.client.query({query: GetLogedUserIDQuery})
          if (!data.logedUser) throw new Error('用户未登录')
          const adminEmail = data.logedUser.email
          if (!data.logedUser.role.isAdmin) throw new Error('没有权限操作')
          try {
            const feedback = await Feedback.findByIdAndUpdate(id, {status}).exec()
            if (feedback.postedUser && feedback.postedUser.email) {
              const nodemailer = require('nodemailer')
              let transporter = nodemailer.createTransport({
                host: 'smtp.163.com',
                port: 465,
                secure: true,
                auth: {
                  user: emailAccount,
                  pass: emailPassword
                }
              })
              let result = ''
              switch (status) {
                case 'ADOPTED':
                  result = '您的意见已经被采纳，工程师正在改进中。。。'
                  break
                case 'REJECTED':
                  result = `您的意见经核查未被采纳，原因是：${rejectReason}。`
                  break
                default:
                  result = '您的意见已经被采纳，错误已经修复或者新功能已经添加，欢迎体验并再次反馈！'
              }
              let mailOptions = {
                from: `"管理员" <${emailAccount}>`,
                to: feedback.postedUser.email,
                subject: '感谢您的反馈',
                text: result,
                html: `<div><h1>${result}</h1></div>`
              }
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  reject(error)
                }
                resolve(true)
              })
            }
            resolve(true)
          } catch (e) {
            reject(e)
          }
        })
      },
      addToReturnPlan (obj, {bookIds, expireAt}, context) {
        const Reserve = context.db.model('Reserve')
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const plan = await Reserve.update({userId: data.logedUser.id, kind: 'RETURN'}, {
              expireAt,
              $addToSet: {bookIds: {$each: bookIds}}
            }, {upsert: true}).exec()
            resolve(!!plan.nModified)
          } catch (e) {
            reject(e)
          }
        })
      },
      createReadPlan (obj, {plans, title}, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const ReadPlan = context.db.model('ReadPlan')
            const readPlan = await new ReadPlan({plans, title, userId: data.logedUser.id, createAt: new Date()}).save()
            resolve(readPlan)
          } catch (e) {
            reject(e)
          }
        })
      },
      delReadPlan (obj, {id}, context) {
        return new Promise(async (resolve, reject) => {
          try {
            const {data} = await context.client.query({query: GetLogedUserIDQuery})
            if (!data.logedUser) throw new Error('用户未登录')
            const ReadPlan = context.db.model('ReadPlan')
            const plan = ReadPlan.findByIdAndRemove(id).exec()
            resolve(!!plan)
          } catch (e) {
            reject(e)
          }
        })
      }
    },
    Subscription: {
      postAdded: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(POST_ADDED),
          (payload, variables) => {
            return payload.postAdded.sessionId === variables.sessionId;
          }
        )
      }
    }
}
export default resolvers
