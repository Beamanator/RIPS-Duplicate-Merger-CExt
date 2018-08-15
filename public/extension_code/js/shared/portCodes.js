// ==============================================================================
//                   CODES FOR CHROME EXTENSION FILES
// ==============================================================================
const PCs = {
    // name of the react app / background.js port
    PORTNAME_REACT_APP: 'PORT_REACT_APP',

    // name of the content script [advanced search] / background.js port
    PORTNAME_CS_ADVANCED_SEARCH: 'PORT_CS_ADVANCED_SEARCH',
    // name of the content script [advanced search results] / background.js port
    PORTNAME_CS_ADVANCED_SEARCH_RESULTS: 'PORT_CS_ADVANCED_SEARCH_RESULTS',
    // name of the content script [client basic information] / background.js port
    PORTNAME_CS_CLIENT_BASIC_INFORMATION: 'PORT_CS_CLIENT_BASIC_INFORMATION',
    // name of the content script [history] / background.js port
    PORTNAME_CS_HISTORY: 'PORT_CS_HISTORY',
    // name of the content script [other] / background.js port
    PORTNAME_CS_REDIRECT: 'PORT_CS_REDIRECT',

    // ==============================================================================
    //                     REACT APP -> BKG SCRIPT CODES
    // ==============================================================================
    RA_BKG_START_IMPORT: 'RA_BKG_START_IMPORT',
    RA_BKG_ERROR_BKG_CODE_NOT_RECOGNIZED: 'RA_BKG_ERROR_BKG_CODE_NOT_RECOGNIZED',

    // ==============================================================================
    //                 BKG SCRIPT -> REACT APP SCRIPT CODES
    // ==============================================================================
    BKG_RA_INIT_PORT: 'BKG_RA_INIT_PORT',
    BKG_RA_STOP_IMPORT_WITH_ERROR: 'BKG_RA_STOP_IMPORT_WITH_ERROR',

    // ==============================================================================
    //                   CONTENT SCRIPT -> BKG SCRIPT CODES
    // ==============================================================================
    CS_BKG_START_PAGE_REDIRECT: 'CS_BKG_START_PAGE_REDIRECT',
    CS_BKG_STOP_IMPORT: 'CS_BKG_STOP_IMPORT',
    CS_BKG_IMPORT_DONE: 'CS_BKG_IMPORT_DONE',
    CS_BKG_ERROR_CODE_NOT_RECOGNIZED: 'CS_BKG_ERROR_CODE_NOT_RECOGNIZED',

    // ==============================================================================
    //                   BKG SCRIPT -> CONTENT SCRIPT CODES
    // ==============================================================================
    BKG_CS_DO_SOMETHING: 'BKG_CS_DO_SOMETHING',
    BKG_CS_INIT_PORT: 'BKG_CS_INIT_PORT',
    BKG_CS_START_IMPORT: 'BKG_CS_START_IMPORT'
}