import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type Professor {
    id: ID!
    firstName: String!
    lastName: String!
    department: String
    avgRating: Float
    numRatings: Int
    wouldTakeAgainPercent: Float
    avgDifficulty: Float
  }

  type Review {
    quality: Float
    difficulty: Float
    course: String
    date: String
    comment: String
    tags: [String]
    attendance: String
    grade: String
    textbook: String
    onlineClass: String
  }

  type Query {
    searchProfessor(name: String!, school: String!): Professor
    getProfessorReviews(id: String!): [Review]
  }
`; 