// destructure field keys
const {
    SEARCH_RESULTS,
    ACTIVE_CLIENT,
    TAB_CLIENT_BASIC_INFORMATION
} = RIPS_FIELD_KEYS;

// loosely based off RIPS Auto Import CExt
const FIELD_IDS_ADVANCED_SEARCH_RESULTS = {
    [SEARCH_RESULTS]: {
        selector: '#gridContent table tbody tr'
    },
    [ACTIVE_CLIENT]: 'currentID',
    [TAB_CLIENT_BASIC_INFORMATION]: {
        selector: 'a[href="/Stars/ClientDetails/ClientDetails"]'
    }
}