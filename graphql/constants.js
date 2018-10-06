import gql from 'graphql-tag'
export const GetUserByIdQuery = gql`
  query GetUserById($id: ID!){
    user(id: $id){
      role{
        maxHoldCount
        maxDelayDays
        maxBorrowDuration
        maxDelayTimes
      }
    }
  }
`
export const GetUserByNamequery = gql`
  query GetUserByNameQuery($username: String!){
    userByName(username: $username){
      id
    }
  }
`
export const GetLogedUserIDQuery = gql`
  query GetLogedUserID{
    logedUser{
      id
      email
      role{
        isAdmin
      }
      statistics{
        maxHoldCount
      }
    }
  }
`
export const BooksHaveCoverQuery = gql`
  {
    booksHaveCover {
      cover
    }
  }
`
export const BugCoversQuery = gql`
  {
    bugCovers {
      coverId
    }
  }
`
export const CoversQuery = gql`
  query Covers($page: Int!, $size: Int!, $query: String!){
    covers(page: $page, size: $size, query: $query){
      id
      file
    }
  }
`
export const CoversPageQuery = gql`
  query CoversPage($page: Int!, $size: Int!, $filter: CoversFilter!){
    coversPage(page: $page, size: $size, filter: $filter){
      covers{
        id
      }
    }
  }
`
export const CoversTotalQuery = gql`
  query CoversTotal($query: String){
    coversTotal(query: $query)
  }
`
export const DeleteCoverMutation = gql`
  mutation DeleteCoverMutation($id: ID!) {
    delFileByID(id: $id) {
      id
    }
  }
`
export const DeleteFilesMutation = gql`
  mutation DeleteFiles($query: String!){
    delFiles(query: $query)
  }
`
export const GetBookByIDQuery = gql`
  query GetBookByID($id: ID!){
    book(id: $id){
      id
      isbn
      title
      summary
      cover
      authors
      translators
      publisher
      version
      pubDate
      price
      location
      volume
      count
      category
      picture{
        id
        file
      }
    }
  }
`
export const AddFriendMutation = gql`
  mutation AddFriend($friend: ID!){
    addFriend(friend: $friend){
      whose
      friend
      state
    }
  }
`