import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
    createStore, combineReducers, applyMiddleware, compose
} from 'redux';
import thunk from 'redux-thunk';

import App from './App';
import ripsReducer from './store/reducers/rips';
import portReducer from './store/reducers/port';
import tablesReducer from './store/reducers/tables';

// change to create-react-act dev environment specific code
// process.env.NODE_ENV comes from config folder, env.js file
// basically, if we're in development mode, show redux store, but if not
// hide it from that extension.
const composeEnhancers = process.env.NODE_ENV === 'development'
    ? (
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : null || compose
    ) : null
        || compose;

// combine reducers
const rootReducer = combineReducers({
    rips: ripsReducer,
    port: portReducer,
    tables: tablesReducer
});

const store = createStore(rootReducer, composeEnhancers(
    applyMiddleware(thunk)
));

// apply redux store
const app = (
    <Provider store={store}>
        {/* router wraps app, inside provider - if needed */}
        
        {/* div container solves appbar padding issue. */}
        {/* See github issue: https://github.com/mui-org/material-ui/issues/7466 */}
        <div style={{ padding: 20 }}>
            <App />
        </div>
    </Provider>
)

ReactDOM.render(app, document.getElementById('root'));
