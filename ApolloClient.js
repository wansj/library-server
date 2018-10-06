import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'node-fetch'
import { localUrl } from './settings'
/*使用ApolloClient来实现microservices之间的互相调用，client对象存储在context里，
在resolver中可以通过context.client.query|mutate来调用其他微服务（如UploadService）*/
// export const client = new ApolloClient({
//   link: new HttpLink({ uri: localUrl, fetch: fetch }),
//   cache: new InMemoryCache()
// })
export const getClient = (token) => {
  const customFetch = (uri, options) => {
    if (token) options.headers.Authorization = token
    return fetch(uri, options)
  }
  return new ApolloClient({
    link: createHttpLink({ uri: localUrl, fetch: customFetch }),
    cache: new InMemoryCache()
  })
}