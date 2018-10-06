import {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  introspectSchema,
  mergeSchemas
} from 'graphql-tools'
import { print } from 'graphql'
import { withFilter } from 'graphql-subscriptions'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import resolvers from './resolvers'
const Types = require('./Types')
const Query = require('./Query')
const Mutation = require('./Mutation')
const Subscription = require('./Subscription')
const pubsub = new RedisPubSub()
import { remoteSchemaUrl, remoteSchemaUrl2 } from '../settings'
import fetch from 'node-fetch'
// import { GetLogedUserIDQuery } from './constants'
const iconv = require('iconv-lite')

const generateRemoteSchema = async () => {
  /**
   * 此处不能使用JSON.stringify({ query, variables, operationName })，否则会使variables: {file: Promise}变成{file: {}}
   */
  const fetcher = async ({ query, variables, operationName, context }) => {
    let body = Object.assign({}, { query, variables, operationName })
    if (variables && variables.file) {
      let { stream, filename, mimetype, encoding } = await variables.file
      stream = await new Promise(((resolve, reject) => {
        stream.pipe(iconv.decodeStream('base64')).collect(function(err, body) {
          if(err) reject(err)
          else resolve(body)
        })
      }))
      body.variables.file = { stream, filename, mimetype, encoding }
    } else if (variables && variables.files) {
      const result = await Promise.all(variables.files.map(promise => {
        return promise.then(async ({ stream, filename, mimetype, encoding }) => {
          // 解码stream
          stream = await new Promise((resolve, reject) => {
            stream.pipe(iconv.decodeStream('base64')).collect(function(err, body) {
              if(err) reject(err)
              else resolve(body)
            })
          })
          return { stream, filename, mimetype, encoding }
        })
      }))
      body.variables.files = result
    }
    body = JSON.stringify(body)
    const fetchResult = await fetch(remoteSchemaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body
    })
    return fetchResult.json()
  }
  const schema = await introspectSchema(fetcher)
  const executableSchema = makeRemoteExecutableSchema({
    schema,
    fetcher
  })
  return executableSchema
}

const generateUserSchema = async () => {
  const fetcher = async ({ query, variables, operationName, context }) => {
    let headers = { 'Content-Type': 'application/json' }
    // 这里要注意的是context是{graphqlContext: {db,client,authorization}}形式的，直接使用官网文档上context.authorization是不对的
    if (context && context.graphqlContext.authorization) headers.authorization = context.graphqlContext.authorization
    const fetchResult = await fetch(remoteSchemaUrl2, {
      headers,
      method: 'POST',
      // 由于UserService中使用的是apollo-server-core2.0，query必须是string,所以必须使用print将query转化成string
      // 解决方法来自于https://github.com/apollographql/graphql-tools/issues/891
      body: JSON.stringify({ query: print(query), variables, operationName })
    })
    return fetchResult.json()
  }
  const schema = await introspectSchema(fetcher)
  const executableSchema = makeRemoteExecutableSchema({
    schema,
    fetcher
  })
  return executableSchema
}
export const buildSchema = async () => {
  const fileSchema = await generateRemoteSchema()
  const userSchema = await generateUserSchema()
  const bookSchema =  makeExecutableSchema({
    typeDefs: [Query, Mutation, Subscription, Types],
    resolvers
  })
  const linkTypeDefs = `
    extend type Book {
      picture: File
    }
    extend type File {
      book: Book
      buggy: BugReport
    }
    extend type User {
      photo: File
      statistics: Statistics
    }
    extend type Record {
      user: User
    }
    extend type BookComment {
      user: User
    }
    extend type Feedback {
      postedUser: User
    }
    extend type Subscription {
      friendAdded(userId: String!): Friend
      friendApproved(userId: String!): Friend
      tokenExpired(token: String): String
    }
  `
  const schema = mergeSchemas({
    schemas: [bookSchema, fileSchema, userSchema, linkTypeDefs],
    resolvers: mergeInfo => ({
      Book: {
        picture: {
          fragment: `fragment BookFragment on Book { cover }`,
          resolve(parent, args, context, info) {
            const id = parent.cover
            if (!id) return ''
            const promise = mergeInfo.delegate('query', 'fileByID', { id }, context, info)
            // 如果id不是null，但是查询不到File的话，说明外键cover已失效（对应的图片已删除），将cover置null。
            // 这样就不必在删除图片的时候做关联更新了
            promise.then((data) => {
              if (!data && id) {
                mergeInfo.delegate('mutation', 'updateBookByID', { id: parent.id, book: { cover: null } }, context, info)
              }
            })
            return promise
          }
        }
      },
      File: {
        book: {
          fragment: `fragment FileFragment on File { id }`,
          resolve(parent, args, context, info) {
            const id = parent.id
            if (id === null) return ''
            return mergeInfo.delegate('query', 'bookByCoverID', { id }, context, info)
          }
        },
        buggy: {
          fragment: `fragment FileFragment on File { id }`,
          resolve(parent, args, context, info) {
            const id = parent.id
            if (id === null) return ''
            return mergeInfo.delegate('query', 'buggy', { id }, context, info)
          }
        }
      },
      User: {
        photo: {
          fragment: `fragment UserFragment on User { avatar }`,
          resolve(parent, args, context, info) {
            if (!parent.avatar) return ''
            return mergeInfo.delegate('query', 'fileByID', { id: parent.avatar }, context, info)
          }
        },
        statistics: {
          fragment: `fragment UserFragment2 on User { id }`,
          resolve(parent, args, context, info) {
            if (!parent.id) return null
            return mergeInfo.delegate('query', 'userStatistics', { userId: parent.id }, context, info)
          }
        }

      },
      Record: {
        user: {
          fragment: `fragment RecordFragment on Record { userId }`,
          resolve(parent, args, context, info) {
            if (!parent.userId) return null
            return mergeInfo.delegate('query', 'user', { id: parent.userId }, context, info)
          }
        }
      },
      BookComment: {
        user: {
          fragment: `fragment BookCommentUser on BookComment { userId }`,
          resolve(parent, args, context, info) {
            if (!parent.userId) return null
            return mergeInfo.delegate('query', 'user', { id: parent.userId }, context, info)
          }
        }
      },
      Feedback: {
        postedUser: {
          fragment: `fragment FeedbackFragment on Feedback { postBy }`,
          resolve(parent, args, context, info) {
            if (!parent.postBy) return null
            return mergeInfo.delegate('query', 'user', { id: parent.postBy }, context, info)
          }
        }
      },
      Subscription: {
        friendAdded: {
          subscribe: withFilter(
            () => pubsub.asyncIterator('friendAdded'),
            async (payload, variables, context) => {
              // console.log(payload.friendAdded.friend === variables.userId)
              return payload.friendAdded.friend === variables.userId
            }
          )
        },
        friendApproved: {
          subscribe: withFilter(
            () => pubsub.asyncIterator('friendApproved'),
            async (payload, variables, context) => {
              console.log(payload.friendApproved.whose)
              console.log(variables.userId)
              return payload.friendApproved.whose === variables.userId
            }
          )
        },
        tokenExpired: {
          subscribe: withFilter(
            () => pubsub.asyncIterator('tokenExpired'),
            async (payload, variables, context) => {
              console.log(payload.tokenExpired)
              console.log(context.authToken.replace('Bearer ', ''))
              return payload.tokenExpired === context.authToken.replace('Bearer ', '')
            }
          )
        }
      }
    })
  })
  return schema
}
