import { ApolloServer } from 'apollo-server-micro';
import { typeDefs } from '../../graphql/schema';
import { resolvers } from '../../graphql/resolvers';
import Cors from 'micro-cors';

const cors = Cors();

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  persistedQueries: false,
  cache: 'bounded',
  context: ({ req }) => {
    console.log('=== Request Debug Info ===');
    
    // Check if request is coming from RapidAPI
    const isRapidAPIRequest = 
      req.headers['x-rapidapi-host'] === 'ratemyprofessor-graphql-api.p.rapidapi.com' &&
      (req.headers['x-rapidapi-proxy-secret'] || req.headers['x-mashape-proxy-secret']);

    console.log('\nRequest Authentication:');
    console.log('Is RapidAPI Request:', isRapidAPIRequest);
    console.log('RapidAPI Host:', req.headers['x-rapidapi-host']);
    console.log('Environment RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY);

    if (!isRapidAPIRequest) {
      console.log('Error: Not a valid RapidAPI request');
      throw new Error('Not authorized - Invalid request source');
    }

    // If it's a valid RapidAPI request, use the environment variable
    console.log('=== Authentication Successful ===');
    return { 
      rapidApiKey: process.env.RAPIDAPI_KEY 
    };
  },
});

const startServer = apolloServer.start();

export default cors(async function handler(req, res) {
  console.log('=== New Request Received ===');
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received');
    res.end();
    return false;
  }
  
  try {
    await startServer;
    console.log('Apollo Server started');
    await apolloServer.createHandler({
      path: '/api/graphql',
    })(req, res);
    console.log('Request handled successfully');
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: error.message });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
}; 