import "regenerator-runtime/runtime"
import { buildSchema } from './graphql/schema'
import { processRequest } from 'apollo-upload-server'
import typeis from 'type-is'
import { runHttpQuery } from 'apollo-server-core'
const {microGraphiql} = require('apollo-server-micro')
const {send, json} = require('micro')
const {get, post, options, router} = require('microrouter')
const db = require('./db')
const cors = require('micro-cors')()
const bodyParser = require('body-parser')
import Book from './models/Book'
import BookComment from './models/BookComment'
import Category from './models/Category'
import BugReport from './models/BugReport'
import Record from './models/Record'
import Collection from './models/Collection'
import Cart from './models/Cart'
import Reserve from './models/Reserve'
import Conversation from './models/Conversation'
import Post from './models/Post'
import Feedback from './models/Feedback'
import ReadPlan from './models/ReadPlan'
// import { GetLogedUserIDQuery } from './graphql/constants'
import * as url from 'url'
import { execute, subscribe } from 'graphql'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { getClient } from './ApolloClient'

// Create WebSocket listener server
const ws = createServer((req, res) => {
  res.writeHead(404)
  res.end()
})
ws.listen('5000', async () => {
  const schema = await buildSchema()
  new SubscriptionServer({
    execute,
    subscribe,
    schema,
    onOperation: async (message, params) => {
      const token = message.payload.authToken
      let options = { ...params, context: { ...params.context }}
      if (token) {
        options.context.authToken = token
        // const client = getClient(token)
        // try {
        //   const {data: {logedUser}} = await client.query({query: GetLogedUserIDQuery})
        //   options.context.authToken = token
        // } catch (e) { }
      }
      return options
    }
    // onConnect: async (connectionParams, webSocket) => {
    //   if (connectionParams.authorization) {
    //     console.log(connectionParams.authorization)
    //     const client = getClient(connectionParams.authorization)
    //     const { data: { logedUser } } = await client.query({query: GetLogedUserIDQuery})
    //     return { currentUser: logedUser.id }
    //   }
    //   throw new Error('Missing auth token!');
    // }
  }, {
    server: ws,
    path: '/subscriptions'
  })
})
ws.on('error', (e) => {console.log(e)})
/**
 * 此处需要注意：graphqlHandler可以是异步函数，但是它必须接受req和res两个参数。因为microGraphql({})返回的是
 * async (req, res) => {}形式的函数，否则会报："string" must be a string的错误，因为不识别graphqlHandler
 * 将其作为字符串来解析了。
 **/
//micro的res对象是通过直接函数返回值返回客户端的，与express有巨大差异。
  //由于使用body-parser使graphqlHandler多层嵌套，内层函数返回值无法返回返回外层，
  // 所以使用Promise以及async/await来实现同步等待并接收内层函数返回值
let graphqlHandler = async (req, res) => {
  // console.log(req.headers.authorization)
  const context = {
    db,
    client: getClient(req.headers.authorization),
    authorization: req.headers.authorization
  }
  const gglResponse = await new Promise((resolve, reject) => {
    const next = async (err) => {
      if (err instanceof Error) {
        throw err
      }
      if (typeis(req, ['multipart/form-data'])) {
        req.body = await processRequest(req)
        // console.log(req.body.variables.files)
      } else {
        if (req.method === 'POST') {
          try {
            req.body = await json(req);
          } catch (err) {
            req.body = undefined;
          }
        } else {
          req.query = url.parse(req.url, true).query;
        }
      }
      const schema = await buildSchema()
      // console.log(req.headers.authorization)
      runHttpQuery([req, res], {
        method: req.method,
        options: {
          schema,
          context
        },
        query: req.method === 'POST' ? req.body : req.query
      }).then((response) => resolve(response)).catch((err) => reject(err))
    }
    bodyParser.json()(req, res, next)
  })
  return gglResponse
}
graphqlHandler = cors(graphqlHandler)
const graphiqlHandler = microGraphiql({
  endpointURL: '/graphql'
})
const server = router(
  options('/graphql', cors()),
  get('/graphql', graphqlHandler ),
  post('/graphql', graphqlHandler),
  get('/graphiql', graphiqlHandler),
  post('/graphiql', graphiqlHandler),
  (req, res) => send(res, 404, 'not found')
)

module.exports = server