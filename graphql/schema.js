import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type SchoolInfo {
    name: String!
    id: String!
    decodedId: String!
    city: String
    state: String
  }

  type Professor {
    id: ID!
    firstName: String
    lastName: String
    department: String
    avgRating: Float
    numRatings: Int
    wouldTakeAgainPercent: Float
    avgDifficulty: Float
  }

  type Query {
    getSchoolId(schoolName: String!): SchoolInfo
    searchProfessor(name: String!, school: String!): Professor
    getProfessorReviews(id: ID!): [Review]
  }

  type Review {
    quality: Float
    difficulty: Float
    course: String
    date: String
    comment: String
    tags: [String]
    attendance: Boolean
    grade: String
    textbook: Boolean
    onlineClass: Boolean
  }
`; 