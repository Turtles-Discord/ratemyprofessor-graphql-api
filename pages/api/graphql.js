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
    // Check if the request is from RapidAPI
    const rapidApiKey = req.headers['x-rapidapi-key'];
    
    if (!rapidApiKey || rapidApiKey !== process.env.RAPIDAPI_KEY) {
      throw new Error('Invalid RapidAPI key');
    }
    
    return { rapidApiKey };
  },
});

const startServer = apolloServer.start();

export default cors(async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }
  
  await startServer;
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);
});

export const config = {
  api: {
    bodyParser: false,
  },
}; 