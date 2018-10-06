'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var host = exports.host = 'localhost';
var database = exports.database = 'library';
var port = exports.port = '27017';
// export const serverPort = '3000'
var remoteSchemaUrl = exports.remoteSchemaUrl = 'http://localhost:4000/graphqlFileUpload';
var remoteSchemaUrl2 = exports.remoteSchemaUrl2 = 'http://localhost:4001/graphqlUser';
var localUrl = exports.localUrl = 'http://localhost:3000/graphql';
// export const REDIS_DOMAIN_NAME = 'localhost'
// export const REDIS_PORT_NUMBER = '6379'
// 每本书默认可以借30天
var MAX_BORROW_DURATION = exports.MAX_BORROW_DURATION = 30 * 24 * 3600 * 1000;
// 每个人最多可同时借5本书
var MAX_HOLD_BOOKS_COUNT = exports.MAX_HOLD_BOOKS_COUNT = 5;
// 可以续借的天数
var MAX_DELAY_DAYS = exports.MAX_DELAY_DAYS = 30 * 24 * 3600 * 1000;
// 可以续借的次数
var MAX_DELAY_TIMES = exports.MAX_DELAY_TIMES = 1;
// 根据计划还书日期查询借书记录时，如果仅指定了起始日期from,未指定结束日期to,那么默认查询从from日期开始，3天内到期的图书
var DEFAULT_CHECK_DURATION = exports.DEFAULT_CHECK_DURATION = 3 * 24 * 3600 * 1000;
// 返回最近读过的5本书
var RECENT_READ_COUNT = exports.RECENT_READ_COUNT = 5;
// 兴趣数量
var INTEREST_CATEGORIES_COUNT = exports.INTEREST_CATEGORIES_COUNT = 3;
var emailAccount = exports.emailAccount = 'wsj-88488111@163.com';
var emailPassword = exports.emailPassword = 'wsj3120682';
//# sourceMappingURL=settings.js.map