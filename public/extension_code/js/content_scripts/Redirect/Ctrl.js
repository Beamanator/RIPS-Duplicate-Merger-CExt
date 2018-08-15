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
const MESSAGE_SOURCE = 'CtrlRedirect';

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
const sendStopImport = (msg) => {
    port.postMessage({
        code: PCs.CS_BKG_STOP_IMPORT,
        message: msg
    });
}

// ===============================================================
//                          PORT LISTENERS
// ===============================================================

port.onMessage.addListener(function(msg) {
    console.log(`[${MESSAGE_SOURCE}] port msg received`, msg);

    switch(msg.code) {
        case PCs.BKG_CS_START_IMPORT:
            Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;
        
        case PCs.BKG_CS_INIT_PORT:
            console.log(`[${MESSAGE_SOURCE}] Successfully connected to background.js`);
            // if autoStart flag is true, send error message bkg because user
            // -> may have moved us off the path of data gathering. Stop
            // -> everything here!
            if (msg.autoStart) {
                const err = `[${MESSAGE_SOURCE}] autoStart is ${msg.autoStart} but` +
                    ' should be unknown / false. User must have redirected on' +
                    ' accident. Stopping script.';
                sendStopImport(err);
            }
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_CS_REDIRECT);
    }
});