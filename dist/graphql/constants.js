'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AddFriendMutation = exports.GetBookByIDQuery = exports.DeleteFilesMutation = exports.DeleteCoverMutation = exports.CoversTotalQuery = exports.CoversPageQuery = exports.CoversQuery = exports.BugCoversQuery = exports.BooksHaveCoverQuery = exports.GetLogedUserIDQuery = exports.GetUserByNamequery = exports.GetUserByIdQuery = undefined;

var _templateObject = _taggedTemplateLiteral(['\n  query GetUserById($id: ID!){\n    user(id: $id){\n      role{\n        maxHoldCount\n        maxDelayDays\n        maxBorrowDuration\n        maxDelayTimes\n      }\n    }\n  }\n'], ['\n  query GetUserById($id: ID!){\n    user(id: $id){\n      role{\n        maxHoldCount\n        maxDelayDays\n        maxBorrowDuration\n        maxDelayTimes\n      }\n    }\n  }\n']),
    _templateObject2 = _taggedTemplateLiteral(['\n  query GetUserByNameQuery($username: String!){\n    userByName(username: $username){\n      id\n    }\n  }\n'], ['\n  query GetUserByNameQuery($username: String!){\n    userByName(username: $username){\n      id\n    }\n  }\n']),
    _templateObject3 = _taggedTemplateLiteral(['\n  query GetLogedUserID{\n    logedUser{\n      id\n      email\n      role{\n        isAdmin\n      }\n      statistics{\n        maxHoldCount\n      }\n    }\n  }\n'], ['\n  query GetLogedUserID{\n    logedUser{\n      id\n      email\n      role{\n        isAdmin\n      }\n      statistics{\n        maxHoldCount\n      }\n    }\n  }\n']),
    _templateObject4 = _taggedTemplateLiteral(['\n  {\n    booksHaveCover {\n      cover\n    }\n  }\n'], ['\n  {\n    booksHaveCover {\n      cover\n    }\n  }\n']),
    _templateObject5 = _taggedTemplateLiteral(['\n  {\n    bugCovers {\n      coverId\n    }\n  }\n'], ['\n  {\n    bugCovers {\n      coverId\n    }\n  }\n']),
    _templateObject6 = _taggedTemplateLiteral(['\n  query Covers($page: Int!, $size: Int!, $query: String!){\n    covers(page: $page, size: $size, query: $query){\n      id\n      file\n    }\n  }\n'], ['\n  query Covers($page: Int!, $size: Int!, $query: String!){\n    covers(page: $page, size: $size, query: $query){\n      id\n      file\n    }\n  }\n']),
    _templateObject7 = _taggedTemplateLiteral(['\n  query CoversPage($page: Int!, $size: Int!, $filter: CoversFilter!){\n    coversPage(page: $page, size: $size, filter: $filter){\n      covers{\n        id\n      }\n    }\n  }\n'], ['\n  query CoversPage($page: Int!, $size: Int!, $filter: CoversFilter!){\n    coversPage(page: $page, size: $size, filter: $filter){\n      covers{\n        id\n      }\n    }\n  }\n']),
    _templateObject8 = _taggedTemplateLiteral(['\n  query CoversTotal($query: String){\n    coversTotal(query: $query)\n  }\n'], ['\n  query CoversTotal($query: String){\n    coversTotal(query: $query)\n  }\n']),
    _templateObject9 = _taggedTemplateLiteral(['\n  mutation DeleteCoverMutation($id: ID!) {\n    delFileByID(id: $id) {\n      id\n    }\n  }\n'], ['\n  mutation DeleteCoverMutation($id: ID!) {\n    delFileByID(id: $id) {\n      id\n    }\n  }\n']),
    _templateObject10 = _taggedTemplateLiteral(['\n  mutation DeleteFiles($query: String!){\n    delFiles(query: $query)\n  }\n'], ['\n  mutation DeleteFiles($query: String!){\n    delFiles(query: $query)\n  }\n']),
    _templateObject11 = _taggedTemplateLiteral(['\n  query GetBookByID($id: ID!){\n    book(id: $id){\n      id\n      isbn\n      title\n      summary\n      cover\n      authors\n      translators\n      publisher\n      version\n      pubDate\n      price\n      location\n      volume\n      count\n      category\n      picture{\n        id\n        file\n      }\n    }\n  }\n'], ['\n  query GetBookByID($id: ID!){\n    book(id: $id){\n      id\n      isbn\n      title\n      summary\n      cover\n      authors\n      translators\n      publisher\n      version\n      pubDate\n      price\n      location\n      volume\n      count\n      category\n      picture{\n        id\n        file\n      }\n    }\n  }\n']),
    _templateObject12 = _taggedTemplateLiteral(['\n  mutation AddFriend($friend: ID!){\n    addFriend(friend: $friend){\n      whose\n      friend\n      state\n    }\n  }\n'], ['\n  mutation AddFriend($friend: ID!){\n    addFriend(friend: $friend){\n      whose\n      friend\n      state\n    }\n  }\n']);

var _graphqlTag = require('graphql-tag');

var _graphqlTag2 = _interopRequireDefault(_graphqlTag);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var GetUserByIdQuery = exports.GetUserByIdQuery = (0, _graphqlTag2.default)(_templateObject);
var GetUserByNamequery = exports.GetUserByNamequery = (0, _graphqlTag2.default)(_templateObject2);
var GetLogedUserIDQuery = exports.GetLogedUserIDQuery = (0, _graphqlTag2.default)(_templateObject3);
var BooksHaveCoverQuery = exports.BooksHaveCoverQuery = (0, _graphqlTag2.default)(_templateObject4);
var BugCoversQuery = exports.BugCoversQuery = (0, _graphqlTag2.default)(_templateObject5);
var CoversQuery = exports.CoversQuery = (0, _graphqlTag2.default)(_templateObject6);
var CoversPageQuery = exports.CoversPageQuery = (0, _graphqlTag2.default)(_templateObject7);
var CoversTotalQuery = exports.CoversTotalQuery = (0, _graphqlTag2.default)(_templateObject8);
var DeleteCoverMutation = exports.DeleteCoverMutation = (0, _graphqlTag2.default)(_templateObject9);
var DeleteFilesMutation = exports.DeleteFilesMutation = (0, _graphqlTag2.default)(_templateObject10);
var GetBookByIDQuery = exports.GetBookByIDQuery = (0, _graphqlTag2.default)(_templateObject11);
var AddFriendMutation = exports.AddFriendMutation = (0, _graphqlTag2.default)(_templateObject12);
//# sourceMappingURL=constants.js.map