// ==============================================================================
//                   CODES FOR CHROME EXTENSION FILES
// ==============================================================================
// name of the react app / background.js port
const REACT_APP_PORT = 'REACT_APP_PORT';
// name of the content script / background.js port
const CONTENT_SCRIPT_PORT = 'CONTENT_SCRIPT_PORT';

// ==============================================================================
//                     REACT APP -> BKG SCRIPT CODES
// ==============================================================================
// receive codes (to background.js)
const INIT_PORT = 'INIT_PORT';
// send codes (to react app)

// ==============================================================================
//                   CONTENT SCRIPT -> BKG SCRIPT CODES
// ==============================================================================
// receive codes (to background.js)
const START_IMPORT = 'START_IMPORT';
// send codes (to content script)