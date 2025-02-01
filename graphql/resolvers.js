import fetch from 'node-fetch';

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
        const response = await fetch('https://www.ratemyprofessors.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
            'Origin': 'https://www.ratemyprofessors.com',
            'Referer': 'https://www.ratemyprofessors.com/'
          },
          body: JSON.stringify({
            query: `
              query TeacherSearchQuery($query: TeacherSearchQuery!) {
                newSearch {
                  teachers(query: $query) {
                    edges {
                      node {
                        id
                        firstName
                        lastName
                        department
                        avgRating
                        numRatings
                        wouldTakeAgainPercent
                        avgDifficulty
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              query: {
                text: name,
                schoolID: schoolId,
                fallback: true
              }
            },
            operationName: "TeacherSearchQuery"
          })
        });

        const data = await response.json();
        console.log('RMP API Response:', JSON.stringify(data, null, 2));

        if (data?.data?.newSearch?.teachers?.edges?.[0]?.node) {
          const professor = data.data.newSearch.teachers.edges[0].node;
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