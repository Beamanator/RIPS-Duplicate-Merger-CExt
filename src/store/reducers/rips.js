import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utils';

// import { sampleData } from './ripsHelper';

const initialState = {
    // TODO: get rid of fake state from ripsHelper.js
    // data: sampleData,
    data: {},
    loading: false,
    error: null
};

const ripsFetchStart = (state, action) => {
    return updateObject(state, {
        loading: true, error: null
    });
};

const ripsFetchFail = (state, action) => {
    return updateObject(state, {
        loading: false, error: action.error
    });
};

const ripsFetchSuccess = (state, action) => {
    return updateObject(state, {
        loading: false,
        // make sure data is the correct format elsewhere, not here!
        data: action.data
    });
};

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case actionTypes.RIPS_FETCH_START: return ripsFetchStart(state, action);
        case actionTypes.RIPS_FETCH_FAIL: return ripsFetchFail(state, action);
        case actionTypes.RIPS_FETCH_SUCCESS: return ripsFetchSuccess(state, action);

        default:
            return state;
    }
};

export default reducer;