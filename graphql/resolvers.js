import { searchProfessor, getReviews } from '../utils/rmp-api';

export const resolvers = {
  Query: {
    searchProfessor: async (_, { name, school }, context) => {
      // Verify rate limits and API key here
      return await searchProfessor(name, school);
    },
    getProfessorReviews: async (_, { id }, context) => {
      return await getReviews(id);
    },
  },
}; 