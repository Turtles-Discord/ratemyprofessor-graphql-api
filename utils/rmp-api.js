import axios from 'axios';

const RMP_GRAPHQL_URL = 'https://www.ratemyprofessors.com/graphql';

export async function searchProfessor(name, school) {
  try {
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
          schoolID: school,
          fallback: true
        }
      }
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const professor = response.data?.data?.newSearch?.teachers?.edges[0]?.node;
    return professor ? {
      ...professor,
      id: atob(professor.id).split('-')[1]
    } : null;

  } catch (error) {
    console.error('Error searching professor:', error);
    throw error;
  }
}

export async function getReviews(professorId) {
  // Implement review fetching similar to your existing code
  // This will use the logic from your content.js
} 