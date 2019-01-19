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
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.PRE_LOGIN;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_PRE_LOGIN });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
// Note: probably none - nothing exciting needs to happen here.

// ===============================================================
//                     MESSAGE POSTING FUNCTIONS
// ===============================================================
// Note: port codes come from "../js/portCodes.js"
const sendBkgLoginReminder = () => {
    port.postMessage({
        code: PCs.CS_BKG_LOGIN_REMINDER
    });
}

// ===============================================================
//                          PORT LISTENERS
// ===============================================================

port.onMessage.addListener(function(msg) {
    const {
        code, autoImport, autoMerge
    } = msg;

    // Utils_Log(MESSAGE_SOURCE, `Port msg received`, msg);

    switch(code) {
        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
            Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            sendBkgLoginReminder();
            break;
        
        case PCs.BKG_CS_INIT_PORT:
            // Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            
            // if either auto... flag is true, send error message bkg because user
            // -> may have moved us off the path of data gathering. Stop
            // -> everything here!
            if (autoImport || autoMerge) {
                const err = `Some auto... flag is true - import<${autoImport}>` +
                    ` or merge<${autoMerge}>. These should be unknown / false.`
                    ' User must have redirected on accident. Stopping script.';
                Utils_KillAll(port, MESSAGE_SOURCE, err);
            }
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_REDIRECT);
    }
});