import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utils';

import initialData from './ripsHelper';

const initialState = {
    data: initialData,
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

const ripsMergeStart = (state, action) => {
    return updateObject(state, {
        loading: true,
    });
};

const ripsMergeFail = (state, action) => {
    return updateObject(state, {
        loading: false,
        error: action.error
    });
};

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case actionTypes.RIPS_FETCH_START: return ripsFetchStart(state, action);
        case actionTypes.RIPS_FETCH_FAIL: return ripsFetchFail(state, action);
        case actionTypes.RIPS_FETCH_SUCCESS: return ripsFetchSuccess(state, action);

        case actionTypes.RIPS_MERGE_START: return ripsMergeStart(state, action);
        case actionTypes.RIPS_MERGE_FAIL: return ripsMergeFail(state, action);

        default:
            return state;
    }
};

export default reducer;