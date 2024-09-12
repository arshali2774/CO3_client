import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://co3-server-8jbr.onrender.com/graphql', // Replace with your GraphQL endpoint
  cache: new InMemoryCache(),
});

export default client;
