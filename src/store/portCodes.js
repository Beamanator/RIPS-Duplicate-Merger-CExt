// ==============================================================================
//                           CODES FOR REACT APP FILES
// ==============================================================================

// ---------------------- INTERNAL CODES -----------------------
// constant to hold the name of the react app / background.js port
export const REACT_APP_PORT = 'REACT_APP_PORT';
// comes with payload errCode (code that errored in actions/port.js)
export const ERROR_BKG_CODE_NOT_RECOGNIZED = 'ERROR_BKG_CODE_NOT_RECOGNIZED';

// ---------------------- EXTERNAL CODES -----------------------
// receive codes -> background (BKG) to react app (BA)
export const BKG_RA_INIT_PORT = 'INIT_PORT';
export const BKG_RA_ERROR_CODE_NOT_RECOGNIZED = 'ERROR_CODE_NOT_RECOGNIZED';
export const BKG_RA_USER_DATA_PAYLOAD = 'USER_DATA_PAYLOAD';

// send codes -> react app (RA) to background (BKG)
export const RA_BKG_START_IMPORT = 'START_IMPORT';
export const RA_BKG_CONTINUE_IMPORT = 'CONTINUE_IMPORT';
export const RA_BKG_IMPORT_DONE = 'IMPORT_DONE';
