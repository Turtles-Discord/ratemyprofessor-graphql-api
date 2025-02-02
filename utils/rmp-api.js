import axios from 'axios';

const RMP_GRAPHQL_URL = 'https://www.ratemyprofessors.com/graphql';

export async function searchProfessor(name, schoolId) {
  console.log('\n=== RMP API Request ===');
  console.log('URL:', RMP_GRAPHQL_URL);
  console.log('Name:', name);
  console.log('School ID:', schoolId);

  const query = {
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
    'Authorization': 'Basic dGVzdDp0ZXN0',
    'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'Cookie': 'ccpa-notice-viewed-02=true; trc_cookie_storage=taboola%2520global%253Auser-id%3D5ce11c44-1d00-45d0-af62-9ca1d888df77-tuctb4bc17; _ga=GA1.1.1849503966.1673632720; _ga_WE3KFFCPK9=GS1.1.1673632719.1.1.1673632739.0.0.0'
  };

  try {
    // First, get the CSRF token
    const tokenResponse = await axios.options(RMP_GRAPHQL_URL, {
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
        'Origin': 'https://www.ratemyprofessors.com'
      }
    });

    // Add CSRF token if available
    const csrfToken = tokenResponse.headers['x-csrf-token'];
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }

    console.log('Request Headers:', headers);
    console.log('Request Body:', JSON.stringify(query, null, 2));

    const response = await axios.post(RMP_GRAPHQL_URL, query, { 
      headers,
      withCredentials: true
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    const professor = response.data?.data?.newSearch?.teachers?.edges[0]?.node;
    if (professor) {
      const result = {
        ...professor,
        id: atob(professor.id).split('-')[1]
      };
      console.log('Processed Professor Data:', result);
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
    throw error;
  }
}

export async function getReviews(professorId) {
  // Implement review fetching similar to your existing code
  // This will use the logic from your content.js
} 