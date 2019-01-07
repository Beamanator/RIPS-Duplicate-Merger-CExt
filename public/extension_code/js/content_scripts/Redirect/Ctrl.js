//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// Entire goal of this file is to connect to BKG, then redirect to
// -> advanced search if 'import' is clicked in options page.
// If 'auto import' setting is turned on, throw a warning b/c we
// -> shouldn't have moved off of the normal 3 pages

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.REDIRECT;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_REDIRECT });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
// Note: probably none - nothing exciting needs to happen here.

// ===============================================================
//                     MESSAGE POSTING FUNCTIONS
// ===============================================================
// Note: port codes come from "../js/portCodes.js"

// ===============================================================
//                          PORT LISTENERS
// ===============================================================

port.onMessage.addListener(function(msg) {
    const {
        code, autoImport
    } = msg;

    // Utils_Log(MESSAGE_SOURCE, `Port msg received`, msg);

    switch(code) {
        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
            Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;
        
        case PCs.BKG_CS_INIT_PORT:
            // Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            
            // if autoImport flag is true, send error message bkg because user
            // -> may have moved us off the path of data gathering. Stop
            // -> everything here!
            if (autoImport) {
                const err = `AutoImport is ${autoImport} but` +
                    ' should be unknown / false. User must have redirected on' +
                    ' accident. Stopping script.';
                Utils_KillAll(port, MESSAGE_SOURCE, err);
            }
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_REDIRECT);
    }
});