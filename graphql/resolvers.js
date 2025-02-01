import { searchProfessor as rmpSearch } from '../utils/rmp-api';

const SCHOOL_IDS = {
  'Sacramento State': 'U2Nob29sLTE2NA==',
  'Sacramento State University': 'U2Nob29sLTE2NA=='
};

export const resolvers = {
  Query: {
    searchProfessor: async (_, { name, school }) => {
      console.log('\n=== Search Professor Request ===');
      console.log('Name:', name);
      console.log('School:', school);
      
      const schoolId = SCHOOL_IDS[school];
      console.log('School ID:', schoolId);

      if (!schoolId) {
        console.error('School not found:', school);
        return null;
      }

      try {
        console.log('Calling RMP API with:', { name, schoolId });
        const professor = await rmpSearch(name, schoolId);
        console.log('RMP API Response:', professor);
        
        if (professor) {
          const result = {
            id: professor.id,
            firstName: professor.firstName,
            lastName: professor.lastName,
            department: professor.department,
            avgRating: professor.avgRating,
            numRatings: professor.numRatings,
            wouldTakeAgainPercent: professor.wouldTakeAgainPercent,
            avgDifficulty: professor.avgDifficulty
          };
          console.log('Returning professor data:', result);
          return result;
        }
        console.log('No professor found');
        return null;
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        return null;
      }
    },

    getProfessorReviews: async (_, { id }) => {
      // Implementation for getting reviews
      return [];
    }
  }
}; 