import * as actionTypes from './actionTypes';
import * as portCodes from '../portCodes';

// tell UI the process has started
const ripsFetchStart = () => {
    return {
        type: actionTypes.RIPS_FETCH_START
    };
};
// fail :(
const ripsFetchFail = (error) => {
    return {
        type: actionTypes.RIPS_FETCH_FAIL,
        error: error
    };
};
// KICK OFF PROCESS - collect rips words from the website
export const ripsFetchWords = (port) => {
    return dispatch => {
        // begin collecting words
        dispatch(ripsFetchStart());

        // if in development mode, port may not be available
        if (!port) {
            const errMsg = 'No Port available! Check connection & environment';
            dispatch(ripsFetchFail(errMsg));
            return;
        }

        // Here, send message to background to start collecting data
        port.postMessage({ code: portCodes.START_IMPORT });

        // NOTE: data import actions are called
        // -> and handled in actions/port.js - via a port listener
    };
};
// success! done! - called in port.js actions
export const ripsFetchSuccess = () => {
    return {
        type: actionTypes.RIPS_FETCH_SUCCESS
    };
};
// add payload data to store!
export const ripsAddUserData = (data) => {
    return {
        type: actionTypes.RIPS_ADD_USER_DATA,
        userData: data
    };
};