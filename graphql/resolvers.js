import { searchProfessor as rmpSearch } from '../utils/rmp-api';

const SCHOOL_IDS = {
  'Sacramento State': 'U2Nob29sLTE2NA==',
  'Sacramento State University': 'U2Nob29sLTE2NA=='
};

export const resolvers = {
  Query: {
    searchProfessor: async (_, { name, school }) => {
      console.log('Searching for professor:', name, 'at school:', school);
      
      const schoolId = SCHOOL_IDS[school];
      if (!schoolId) {
        console.error('School not found:', school);
        return null;
      }

      try {
        // Use the utility function instead of direct fetch
        const professor = await rmpSearch(name, schoolId);
        
        if (professor) {
          return {
            id: professor.id,
            firstName: professor.firstName,
            lastName: professor.lastName,
            department: professor.department,
            avgRating: professor.avgRating,
            numRatings: professor.numRatings,
            wouldTakeAgainPercent: professor.wouldTakeAgainPercent,
            avgDifficulty: professor.avgDifficulty
          };
        }
        return null;
      } catch (error) {
        console.error('Error searching for professor:', error);
        return null;
      }
    },

    getProfessorReviews: async (_, { id }) => {
      // Implementation for getting reviews
      return [];
    }
  }
}; 