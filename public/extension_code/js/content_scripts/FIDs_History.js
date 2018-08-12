// destructure field keys
const {
    ACTION_DATE, ACTION_NAME, ACTION_CASEWORKER, ACTION_NOTES
} = RIPS_FIELD_KEYS;

// destructure page key(s)
const { HISTORY } = RIPS_PAGE_KEYS;

// loosely based off RIPS Auto Import CExt
const FIELD_IDS_HISTORY = {
    // [PAGE_KEYS.CLIENT_BASIC_INFORMATION]: {}
    [HISTORY]: {
        // TODO: add history page's field keys
        // -> dynamic, based off table, not html ids
    }
}