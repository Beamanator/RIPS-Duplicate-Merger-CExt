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
	// follow the following steps
	// 1) get CBI's clientNum, make sure we're looking at the right
	// -> client
	const starsNumFieldID = FIELD_IDS_CLIENT_BASIC_INFORMATION[STARS_NUMBER];
	const starsNumElem = document.querySelector('#' + starsNumFieldID);
	const starsNum = starsNumElem.value;

	// 2.1) if client stars nums don't match, error and stop import
	if (starsNum !== clientNum) {
		let err = 'ERR: Somehow got to CBI page' +
			' of wrong client!! StARS numbers don\'t match: ' +
			`<${starsNum}> (from CBI) vs <${clientNum}> (from CExt)`;
		Utils_Error(MESSAGE_SOURCE, err);
		// TODO: send error back to bkg, stop import
		return;
	}

	// 2.2) No issues! Gather all the rest of the data
	// convert FID container into array
	const data = Object.entries(FIELD_IDS_CLIENT_BASIC_INFORMATION)
		// map field selectors to their field values
		.map(([key, selector], i) => ({
			key: document.querySelector('#' + selector).value
		}));

	// 3) data gathered, now send it back to background.js to store
	debugger;

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