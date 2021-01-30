import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { setContext } from '@apollo/client/link/context'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from'@apollo/client/utilities'
import {
  split,
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client'
import { AUTH_TOKEN } from './constant'

const httpLink = createHttpLink({
  uri: "http://localhost:4000/"
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

const wslink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect:true,
    connectionParams:{
      authToken:localStorage.getItem(AUTH_TOKEN)
    }
  }
});

//checking subscription type, if it is subscription go to wslink else httplink
const link = split(
  ({query}) => {
    const {kind, operation} = getMainDefinition(query);
    return(
      kind === 'OperationDefinition' &&
      operation === 'subscription'
    );
  },
  wslink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})


ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,

  document.getElementById('root')
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
