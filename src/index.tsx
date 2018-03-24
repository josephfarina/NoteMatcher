import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

// Uncomment for performance testing
// const {whyDidYouUpdate} = require('why-did-you-update')
// whyDidYouUpdate(React)

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
