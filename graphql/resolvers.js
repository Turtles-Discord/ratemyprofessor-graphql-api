import axios from 'axios';

const RMP_GRAPHQL_URL = 'https://www.ratemyprofessors.com/graphql';

// Common schools mapping
const SCHOOL_IDS = {
  'Cosumnes River College': 'U2Nob29sLTE5Mzg=',     // CRC
  'American River College': 'U2Nob29sLTEzMDQ=',      // ARC
  'Sacramento City College': 'U2Nob29sLTEzMDM=',     // SCC
  'Folsom Lake College': 'U2Nob29sLTQ2ODc=',        // FLC
  'Sacramento State': 'U2Nob29sLTE2NA==',           // CSUS
  'Sacramento State University': 'U2Nob29sLTE2NA=='  // Alternative name for CSUS
};

// Updated headers with new security tokens
const headers = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://www.ratemyprofessors.com',
  'Referer': 'https://www.ratemyprofessors.com/',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'Authorization': 'Basic dGVzdDp0ZXN0',
  'Cookie': 'ccpa-notice-viewed-02=true; _gid=GA1.2.1994820145.1709060146; _gcl_au=1.1.1843302301.1709060146; _ga=GA1.1.450661597.1709060146; _uetsid=4e1247e0d54411eeb3d683790b4c956e; _uetvid=4e126d30d54411ee8c3a87b0aa4c7ab4; _ga_WEN3XKV610=GS1.1.1709060145.1.1.1709060161.0.0.0',
  'apollographql-client-name': 'rmp-web',
  'apollographql-client-version': '1.0.0'
};

function decodeBase64Id(base64Id) {
  if (!base64Id) return null;
  const decodedId = atob(base64Id);
  const numericId = decodedId.split('-')[1];
  return numericId;
}

export const resolvers = {
  Query: {
    searchProfessor: async (_, { name, school }) => {
      console.log('\n=== Search Professor Request ===');
      console.log('Name:', name);
      console.log('School:', school);

      try {
        // Step 1: Get school ID
        let schoolId = SCHOOL_IDS[school];
        if (!schoolId) {
          console.error('School not found:', school);
          return null;
        }
        console.log('Using school ID:', schoolId);
        console.log('Decoded school ID:', decodeBase64Id(schoolId));

        // Updated professor search query
        const profResponse = await axios.post(RMP_GRAPHQL_URL, {
          operationName: "TeacherSearchQuery",
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
              fallback: true,
              departmentID: null
            }
          }
        }, { 
          headers,
          withCredentials: true
        });

        console.log('Response Status:', profResponse.status);
        console.log('Response Headers:', profResponse.headers);
        console.log('Professor search response:', JSON.stringify(profResponse.data, null, 2));

        const professor = profResponse.data?.data?.newSearch?.teachers?.edges?.[0]?.node;
        if (professor) {
          const result = {
            id: decodeBase64Id(professor.id),
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

        console.log('No professor found in response');
        return null;

      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
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
