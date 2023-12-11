import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import { sha256 } from 'crypto-hash';
import { setContext } from '@apollo/client/link/context';
import { BrowserRouter } from 'react-router-dom';
import Cookies from 'js-cookie';

const { protocol, hostname } = window.location;
const port = hostname === 'localhost' ? ':3000' : '';
const uri = `${protocol}//${hostname}${port}/graphql`;
const httpLink = createHttpLink({ uri });
const authLink = setContext((_, { headers }) => {
  const token = Cookies.get('JWT_TOKEN');
  return {
    headers: {
      ...headers,
      authorization: token || '',
    },
  };
});
const persistedQueriesLink = createPersistedQueryLink({ sha256 });
const linkChain = authLink.concat(persistedQueriesLink).concat(httpLink);

const client = new ApolloClient({
  link: linkChain,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
);
