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

const headers = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://www.ratemyprofessors.com',
  'Referer': 'https://www.ratemyprofessors.com/',
  'apollographql-client-name': 'rmp-web',
  'apollographql-client-version': '1.0.0',
  'Cookie': 'ccpa-notice-viewed-02=true; trc_cookie_storage=taboola%2520global%253Auser-id%3D5ce11c44-1d00-45d0-af62-9ca1d888df77-tuctb4bc17'
};

// Utility function to decode base64 IDs
function decodeBase64Id(base64Id) {
  if (!base64Id) return null;
  const decodedId = atob(base64Id);
  const numericId = decodedId.split('-')[1];
  return numericId;
}

// Get school ID from common list or search RMP
async function getSchoolId(name) {
  console.log('Looking up school ID for:', name);
  
  const schoolId = SCHOOL_IDS[name];
  if (schoolId) {
    console.log('Found in common schools:', schoolId);
    return schoolId;
  }

  // If not in common schools, search RMP
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
    }, { headers });

    const schools = response.data?.data?.newSearch?.schools?.edges || [];
    const matchedSchool = schools.find(e => 
      e.node.name.toLowerCase() === name.toLowerCase()
    );

    if (matchedSchool) {
      console.log('Found school:', matchedSchool.node.name, 'ID:', matchedSchool.node.id);
      return matchedSchool.node.id;
    }
    
    console.log('School not found in RMP search');
    return null;
  } catch (error) {
    console.error('Error searching for school:', error);
    return null;
  }
}

// Main function to search for professor
export async function searchProfessor(name, school) {
  console.log('\n=== RMP API Request ===');
  console.log('Professor Name:', name);
  console.log('School Name:', school);

  try {
    // Step 1: Get school ID
    const schoolId = await getSchoolId(school);
    if (!schoolId) {
      console.error('School not found:', school);
      return null;
    }
    console.log('Using school ID:', schoolId);
    console.log('Decoded school ID:', decodeBase64Id(schoolId));

    // Step 2: Search for professor with detailed logging
    const profQuery = {
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
    };

    console.log('Professor search query:', JSON.stringify(profQuery, null, 2));
    
    const response = await axios.post(RMP_GRAPHQL_URL, profQuery, { 
      headers,
      validateStatus: false // To see all response statuses
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    const professor = response.data?.data?.newSearch?.teachers?.edges?.[0]?.node;
    if (professor) {
      const result = {
        ...professor,
        id: decodeBase64Id(professor.id)
      };
      console.log('Found professor:', result);
      return result;
    }

    console.log('No professor found in response');
    return null;

  } catch (error) {
    console.error('RMP API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return null;
  }
}

export async function getReviews(professorId) {
  // Implementation for getting reviews
  return [];
}