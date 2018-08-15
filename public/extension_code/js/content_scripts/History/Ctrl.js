//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = 'CtrlHistory';

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_HISTORY });

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"

// ================================================================
//                          PORT LISTENERS
// ================================================================

/**
 * Controller function for History page - decides what to do
 * based off of passed in action.
 * 
 * @param {object} config 
 */
Main = ( config ) => {
	var action = config.action;
	
	switch(action) {
		// redirect to advanced search to start importing next client
		case 'NEXT_CLIENT_REDIRECT':
			nextClientRedirect();
			break;

		// Action not handled by controller!
		default:
			// console.error('Unhandled action found in CtrlViewAction.js:', action);
			console.error(
				'[DE-DUPLICATOR]', 'in History (no error yet)'
			)
	}
}

port.onMessage.addListener(msg => {
    Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch ( msg.code ) {
        case PCs.BKG_CS_START_IMPORT:
            startImport();
            break;

        // case CONTINUE_IMPORT:
        //     continueImport();
        //     break;
        
        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            // if autoStart flag is true, start automatically!
            if (msg.autoStart) {
                startImport();
            }
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_CS_HISTORY);
    }
});