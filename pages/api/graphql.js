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
    
    console.log('\nRequest Headers:');
    console.log('x-rapidapi-key:', req.headers['x-rapidapi-key']);
    console.log('x-rapidapi-host:', req.headers['x-rapidapi-host']);
    console.log('content-type:', req.headers['content-type']);
    
    console.log('\nRequest Method:', req.method);
    console.log('Request URL:', req.url);
    
    console.log('\nAll Headers:', JSON.stringify(req.headers, null, 2));
    
    // Check RapidAPI key
    const rapidApiKey = req.headers['x-rapidapi-key'];
    
    if (!rapidApiKey) {
      console.log('Error: No RapidAPI key provided');
      throw new Error('No RapidAPI key provided');
    }
    
    if (rapidApiKey !== process.env.RAPIDAPI_KEY) {
      console.log('Error: Invalid RapidAPI key');
      console.log('Received:', rapidApiKey);
      console.log('Expected:', process.env.RAPIDAPI_KEY);
      throw new Error('Invalid RapidAPI key');
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