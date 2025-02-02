import axios from 'axios';

const RMP_GRAPHQL_URL = 'https://www.ratemyprofessors.com/graphql';

// Common schools mapping from the extension
const SCHOOL_IDS = {
  'Cosumnes River College': 'U2Nob29sLTE5Mzg=',     // CRC
  'American River College': 'U2Nob29sLTEzMDQ=',      // ARC
  'Sacramento City College': 'U2Nob29sLTEzMDM=',     // SCC
  'Folsom Lake College': 'U2Nob29sLTQ2ODc=',        // FLC
  'Sacramento State': 'U2Nob29sLTE2NA==',           // CSUS
  'Sacramento State University': 'U2Nob29sLTE2NA=='  // Alternative name for CSUS
};

// Utility functions from the extension
function getSchoolId(name) {
  console.log('Looking up school ID for:', name);
  
  const schoolId = SCHOOL_IDS[name];
  if (!schoolId) {
    console.error('School not found:', name);
    console.log('Supported schools:', Object.keys(SCHOOL_IDS));
    return null;
  }
  
  console.log('Found school ID:', schoolId);
  return schoolId;
}

function decodeBase64Id(base64Id) {
  if (!base64Id) return null;
  const decodedId = atob(base64Id);  // Decodes "VGVhY2hlci0yNTQxODYw" to "Teacher-2541860"
  const numericId = decodedId.split('-')[1];  // Gets "2541860"
  return numericId;
}

export const resolvers = {
  Query: {
    searchProfessor: async (_, { name, school }) => {
      console.log('\n=== Search Professor Request ===');
      console.log('Name:', name);
      console.log('School:', school);

      try {
        // Get school ID using the extension's method
        const schoolId = getSchoolId(school) || await searchSchool(school);
        if (!schoolId) {
          console.error('School not found:', school);
          return null;
        }

        console.log('Using school ID:', schoolId);
        console.log('Decoded school ID:', decodeBase64Id(schoolId));

        const response = await axios.post(RMP_GRAPHQL_URL, {
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

        const professor = response.data?.data?.newSearch?.teachers?.edges?.[0]?.node;
        
        if (professor) {
          return {
            id: decodeBase64Id(professor.id), // Convert base64 ID to numeric
            firstName: professor.firstName,
            lastName: professor.lastName,
            department: professor.department,
            avgRating: professor.avgRating,
            numRatings: professor.numRatings,
            wouldTakeAgainPercent: professor.wouldTakeAgainPercent,
            avgDifficulty: professor.avgDifficulty
          };
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

// Helper function to search for schools not in the common list
async function searchSchool(name) {
  try {
    const response = await axios.post(RMP_GRAPHQL_URL, {
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
          text: name
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

    const schools = response.data?.data?.newSearch?.schools?.edges || [];
    const matchedSchool = schools.find(e => 
      e.node.name.toLowerCase() === name.toLowerCase()
    );

    return matchedSchool?.node?.id || null;
  } catch (error) {
    console.error('Error searching for school:', error);
    return null;
  }
} 