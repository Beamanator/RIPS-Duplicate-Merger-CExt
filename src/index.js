import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
    createStore, combineReducers
} from 'redux';

import App from './App';
import ripsReducer from './store/reducers/rips';
import portReducer from './store/reducers/port';
import registerServiceWorker from './registerServiceWorker';

// TODO: set window.__REDUX_...__ global variable set by
// -> redux chrome extension (for production mode)

// combine reducers
const rootReducer = combineReducers({
    rips: ripsReducer,
    port: portReducer
});

const store = createStore(rootReducer);

// apply redux store
const app = (
    <Provider store={store}>
        {/* router wraps app, inside provider - if needed */}
        <App />
    </Provider>
)

ReactDOM.render(app, document.getElementById('root'));
registerServiceWorker();
