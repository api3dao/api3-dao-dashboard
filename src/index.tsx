import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './app';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// These are injected by fleek (our IPFS hosting service).
// See README.md for more information.
if (process.env.REACT_APP_NODE_ENV! === 'staging') {
  console.log('You are browsing a staging environment!');
}
