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
    // Detailed logging
    console.log('=== Request Debug Info ===');
    console.log('Environment Variables:');
    console.log('RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY);
    
    // Check for both header formats
    const rapidApiKey = req.headers['x-rapidapi-key'] || req.headers['X-RapidAPI-Key'];
    
    console.log('\nRequest Headers:');
    console.log('x-rapidapi-key:', rapidApiKey);
    console.log('x-rapidapi-host:', req.headers['x-rapidapi-host']);
    console.log('content-type:', req.headers['content-type']);
    
    // Check RapidAPI proxy secret
    const proxySecret = req.headers['x-rapidapi-proxy-secret'] || req.headers['x-mashape-proxy-secret'];
    console.log('Proxy Secret:', proxySecret);
    
    if (!rapidApiKey) {
      // Check if this is a RapidAPI request
      if (proxySecret) {
        // If it's from RapidAPI but missing the key, use the environment variable
        console.log('Using environment variable as fallback');
        return { rapidApiKey: process.env.RAPIDAPI_KEY };
      }
      console.log('Error: No RapidAPI key provided');
      throw new Error('No RapidAPI key provided');
    }
    
    console.log('=== Authentication Successful ===');
    return { rapidApiKey };
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