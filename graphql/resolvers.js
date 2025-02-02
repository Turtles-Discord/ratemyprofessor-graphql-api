import axios from 'axios';

const RMP_GRAPHQL_URL = 'https://www.ratemyprofessors.com/graphql';

// Common schools for faster lookup
const COMMON_SCHOOL_IDS = {
  'Cosumnes River College': 'U2Nob29sLTE5Mzg=',     // CRC
  'American River College': 'U2Nob29sLTEzMDQ=',      // ARC
  'Sacramento City College': 'U2Nob29sLTEzMDM=',     // SCC
  'Folsom Lake College': 'U2Nob29sLTQ2ODc=',        // FLC
  'Sacramento State': 'U2Nob29sLTE2NA==',           // CSUS
  'Sacramento State University': 'U2Nob29sLTE2NA=='  // Alternative name for CSUS
};

export const resolvers = {
  Query: {
    searchProfessor: async (_, { name, school }) => {
      console.log('\n=== Search Professor Request ===');
      console.log('Name:', name);
      console.log('School:', school);

      try {
        // Step 1: Get School ID (first check common schools, then search)
        let schoolId = COMMON_SCHOOL_IDS[school];
        
        if (!schoolId) {
          console.log('School not in common list, searching RMP...');
          
          // Search for school
          const schoolSearchResponse = await axios.post(RMP_GRAPHQL_URL, {
            query: `
              query SearchSchoolsQuery($query: SchoolSearchQuery!) {
                newSearch {
                  schools(query: $query) {
                    edges {
                      node {
                        id
                        name
                        city
                        state
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              query: {
                text: school
              }
            }
          }, {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0',
              'Accept': 'application/json',
              'Origin': 'https://www.ratemyprofessors.com',
              'Referer': 'https://www.ratemyprofessors.com/'
            }
          });

          const schools = schoolSearchResponse.data?.data?.newSearch?.schools?.edges || [];
          console.log('Found schools:', schools.map(e => e.node.name));

          // Find best matching school
          const matchedSchool = schools.find(e => 
            e.node.name.toLowerCase() === school.toLowerCase()
          );

          if (matchedSchool) {
            schoolId = matchedSchool.node.id;
            console.log('Found school ID:', schoolId);
          }
        }

        if (!schoolId) {
          console.error('School not found:', school);
          return null;
        }

        // Step 2: Search for professor with school ID
        console.log('Searching for professor with:', { name, schoolId });
        const profResponse = await axios.post(RMP_GRAPHQL_URL, {
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
          }
        }, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
            'Origin': 'https://www.ratemyprofessors.com',
            'Referer': 'https://www.ratemyprofessors.com/'
          }
        });

        const professor = profResponse.data?.data?.newSearch?.teachers?.edges?.[0]?.node;
        
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
          console.log('Found professor:', result);
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