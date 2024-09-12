import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://co3-server-tr2y.onrender.com/graphql', // Replace with your GraphQL endpoint
  cache: new InMemoryCache(),
});

export default client;
