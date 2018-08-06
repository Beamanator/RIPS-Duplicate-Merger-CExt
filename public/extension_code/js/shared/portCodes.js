// ==============================================================================
//                   CODES FOR CHROME EXTENSION FILES
// ==============================================================================
// name of the react app / background.js port
const PORTNAME_REACT_APP = 'PORT_REACT_APP';

// name of the content script [advanced search] / background.js port
const PORTNAME_CS_ADVANCED_SEARCH = 'PORT_CS_ADVANCED_SEARCH';
// name of the content script [client basic information] / background.js port
const PORTNAME_CS_CLIENT_BASIC_INFORMATION = 'PORT_CS_CLIENT_BASIC_INFORMATION';
// name of the content script [history] / background.js port
const PORTNAME_CS_HISTORY = 'PORT_CS_HISTORY';

// ==============================================================================
//                     REACT APP -> BKG SCRIPT CODES
// ==============================================================================

// ==============================================================================
//                 BKG SCRIPT -> REACT APP SCRIPT CODES
// ==============================================================================
const BKG_RA_INIT_PORT = 'BKG_RA_INIT_PORT';


// ==============================================================================
//                   CONTENT SCRIPT -> BKG SCRIPT CODES
// ==============================================================================
const CS_BKG_START_IMPORT = 'CS_BKG_START_IMPORT';

// ==============================================================================
//                   BKG SCRIPT -> CONTENT SCRIPT CODES
// ==============================================================================
const BKG_CS_DO_SOMETHING = 'BKG_CS_DO_SOMETHING';
const BKG_CS_INIT_PORT = 'BKG_CS_INIT_PORT';