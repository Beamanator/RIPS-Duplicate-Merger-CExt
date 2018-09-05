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
// success! done! - called by port.js actions
export const ripsFetchSuccess = (ripsData) => {
    return {
        type: actionTypes.RIPS_FETCH_SUCCESS,
        data: ripsData
    };
};
// KICK OFF PROCESS - collect rips data
export const ripsFetchData = (port, clientNums) => {
    return dispatch => {
        // begin collecting data
        dispatch(ripsFetchStart());

        // if in development mode, port may not be available
        if (!port) {
            const errMsg = 'No Port available! Check connection & environment';
            dispatch(ripsFetchFail(errMsg));
            return;
        }

        // Here, send message to background to start collecting data
        port.postMessage({
            code: portCodes.RA_BKG_START_IMPORT,
            clientNums: clientNums
        });

        // NOTE: data import actions are called
        // -> and handled in actions/port.js - via a port listener
    };
};
// KICK OFF PROCESS - start merging rips clients
export const ripsMergeClients = (port, mergeData, target, others) => {
    return dispatch => {
        // TODO: call action indicating merge is starting?
        // dispatch(ripsMergeStart());

        // if in development mode, port may not be available
        if (!port) {
            const errMsg = 'No Port available! Check connection & environment';
            dispatch(ripsFetchFail(errMsg));
            return;
        }

        console.log('Time to merge!', mergeData);

        // send message and data to background to begin merge
        port.postMessage({
            code: portCodes.RA_BKG_START_MERGE,
            data: mergeData,
            targetClientNum: target,
            archiveClientNums: others
        });

        // NOTE: data import actions are called
        // -> and handled in actions/port.js - via a port listener
    };
};