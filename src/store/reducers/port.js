import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utils';

const initialState = {
    port: null,
    error: null,
    importInProgress: false,
    mergeInProgress: false,
};

const portSet = (state, action) => updateObject(state, {
    port: action.port, error: null
});
const portRemove = (state, action) => updateObject(state, {
    port: null, error: null
});

const startImport = (state, action) => updateObject(state, {
    importInProgress: true,
});
const stopImport = (state, action) => updateObject(state, {
    importInProgress: false,
});

const startMerge = (state, action) => updateObject(state, {
    mergeInProgress: true,
});
const stopMerge = (state, action) => updateObject(state, {
    mergeInProgress: false,
});

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.BACKGROUND_PORT_SET: return portSet(state, action);
        case actionTypes.BACKGROUND_PORT_REMOVE: return portRemove(state, action);

        case actionTypes.APP_IMPORT_START: return startImport(state, action);
        case actionTypes.APP_IMPORT_STOP: return stopImport(state, action);
        case actionTypes.APP_MERGE_START: return startMerge(state, action);
        case actionTypes.APP_MERGE_STOP: return stopMerge(state, action);

        default:
            return state;
    }
};

export default reducer;