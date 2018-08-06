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
const port = chrome.runtime.connect({ name: CS_HISTORY_PORT });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
/**
 * Function gets ready for next client, a.k.a. redirects user to Advanced Search
 * page - after getting action state and client index ready
 * 
 */
nextClientRedirect = () => {
	// store action state (searching for next client), then redirect
	var mObj = {
		action: 'store_data_to_chrome_storage_local',
		dataObj: {
			'ACTION_STATE': 'SEARCH_FOR_CLIENT',
			'CLIENT_INDEX': '' // auto increment client index
		}
	};
	
	// saves action state, then redirects to Advanced Search page
	chrome.runtime.sendMessage(mObj, function(response) {
		Utils_NavigateToTab( Utils_GetTabHref( 'AdvancedSearch' ) );
	});
}

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"
// TODO: add to utils?
const sendPortCodeError = (invalidCode) => {
    port.postMessage({
        code: ERROR_CODE_NOT_RECOGNIZED, source: 'main.js',
        data: `Code <${invalidCode}> not recognized!`
    });
};

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
    console.log('<Main.js> port msg received', msg);

    switch ( msg.code ) {
        case START_IMPORT:
            startImport();
            break;

        case CONTINUE_IMPORT:
            continueImport();
            break;
        
        case INIT_PORT:
            console.log('[Page] Successfully connected to background.js');
            // if autoStart flag is true, start automatically!
            if (msg.autoStart) {
                startImport();
            }
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, msg.code, PORTNAME_CS_HISTORY);
    }
});