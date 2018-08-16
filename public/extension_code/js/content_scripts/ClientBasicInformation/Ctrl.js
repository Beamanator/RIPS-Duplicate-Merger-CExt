//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = 'CtrlClientBasicInformation';

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_CLIENT_BASIC_INFORMATION });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startImport = (clientNum) => {
	// TODO: follow the following steps
	// 1) get CBI's clientNum, make sure we're looking at the right
	// -> client
	debugger;
	// 2.1) If yes, gather all the rest of the data
	// 2.2) If no, error and fail the import
	// 3) data gathered, now send it back to background.js to store
	// 4) redirect to next page
}

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"

// ================================================================
//                          PORT LISTENERS
// ================================================================

port.onMessage.addListener(function(msg) {
    Utils_Log(MESSAGE_SOURCE, `port msg received`, msg);

    switch(msg.code) {
        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            // if autoStart flag is true, start automatically!
            if (msg.autoStart) {
				startImport( msg.clientNum );
            }
			break;
			
		case PCs.BKG_CS_START_IMPORT:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_CS_CLIENT_BASIC_INFORMATION);
    }
});