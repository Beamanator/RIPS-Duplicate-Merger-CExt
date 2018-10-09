// destructure field keys
const {
    // save button
    NEW_SERVICE_SAVE_BUTTON,

    // get some action keys for use during service processing
    ACTION_SERVICE, ACTION_DATE, ACTION_CASEWORKER,

    // selectors needed for rips form elements
    NEW_SERVICE_DESCRIPTION, NEW_SERVICE_START_DATE,
    NEW_SERVICE_ACTION, NEW_SERVICE_CASEWORKER,
} = RIPS_FIELD_KEYS;

// loosely based off RIPS Auto Import CExt
const FIELD_IDS_NEW_SERVICE = {
    [NEW_SERVICE_SAVE_BUTTON]: 'input[value="Save"]',

    // main form fields
    [NEW_SERVICE_DESCRIPTION]: 'select#lscCodeValue',
    [NEW_SERVICE_START_DATE]: 'input#DATE_OF_MATTER_START',
    [NEW_SERVICE_CASEWORKER]: 'select#cwValue',

    // action selector is here "just in case" for validation
    [NEW_SERVICE_ACTION]: 'select#ddlActionValue',
}