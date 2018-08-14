//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = 'CtrlAdvancedSearchResults';

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_ADVANCED_SEARCH });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const analyzeSearchResult = ( clientNum ) => {
    Utils_Log(MESSAGE_SOURCE, 'Analyzing client num: ', clientNum);
    // TODO: complete this function
}

// ===============================================================
//                     MESSAGE POSTING FUNCTIONS
// ===============================================================
// Note: port codes come from "../js/portCodes.js"


// ===============================================================
//                          PORT LISTENERS
// ===============================================================

port.onMessage.addListener(function(msg) {
    Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch(msg.code) {
        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            // if autoStart flag is true, start automatically importing!
            if (msg.autoStart) {
                // TODO: analyze search results page
                // analyzeSearchResult( msg.clientNum );
            }
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_CS_ADVANCED_SEARCH);
    }
});
