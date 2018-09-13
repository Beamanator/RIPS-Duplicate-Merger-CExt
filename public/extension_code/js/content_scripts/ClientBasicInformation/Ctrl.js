//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.CLIENT_BASIC_INFORMATION;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_CLIENT_BASIC_INFORMATION });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const checkViewingCorrectClient = (clientNum) => {
	// first get selector, then get data in selector (starsNum)
	const starsNumFieldSelector = FIELD_IDS_CLIENT_BASIC_INFORMATION[STARS_NUMBER];
	const starsNumElem = document.querySelector(starsNumFieldSelector);
	const starsNum = starsNumElem.value;
	
	// if client stars nums match, return true!
	if (starsNum === clientNum) {
		return true;
	}
	// -> else, throw error and return false
	else {
		const err = 'ERR: Somehow got to CBI page' +
			' of wrong client!! Given StARS number doesn\'t match!';
		Utils_Error(MESSAGE_SOURCE, err);
		return false;
	}
}

const startImport = (clientNum) => {
	// 1) check if we're looking at the correct client
	const atCorrectClient = checkViewingCorrectClient(clientNum);

	// 2.1) if client stars nums don't match, error and stop import
	if (!atCorrectClient) {
		// no error message here needed
		// TODO: send error back to bkg, stop import
		return;
	}

	// 2.2) No issues! Gather all the rest of the data
	// convert FID container into array
	let allPass = true;
	const fieldsToSkip = [STARS_NUMBER];
	const data = Object.entries(FIELD_IDS_CLIENT_BASIC_INFORMATION)
		// convert field selectors to their field values
		.reduce((container, [key, selector]) => {
			// short-circuit below logic if fatal error found before
			if (!allPass) return container;

			// skip fields that aren't necessary
			if (fieldsToSkip.includes(key)) return container;

			const elem = document.querySelector(selector);
			// TODO: throw error & stop import if elem is null
			let val = '';

			// TODO: make sure vuln data is imported (somewhere)

			// handle html types differently
			switch(elem.type) {
				case 'text':
				case 'textarea':
					val = elem.value.trim();
					break;

				case 'checkbox':
					val = elem.checked;
					break;

				case 'select-one':
					val = elem.selectedOptions[0].innerText.trim();
					break;

				default:
					// TODO: stop import!
					let err = 'ERR: Found an unhandled html elem ' +
						'type while gathering client data! Stopping' +
						' here - ' + selector;
					Utils_Error(MESSAGE_SOURCE, err);
					allPass = false;
					return '';
			}
			container[key] = val;
			return container;
		}, {});

	// 3) data gathered, now send it back to background.js to store
	Utils_SendDataToBkg(port, MESSAGE_SOURCE, data);

	// 4) redirect to next page
	Utils_SendRedirectCode(port, 'Addresses/Addresses');
	// Note: no need to handle "no vuln / dependent data" popup
	// -> warning since redirect skips that check
}

const startMerge = (clientNum, data) => {
	// 1) check if we're looking at the correct client
	const atCorrectClient = checkViewingCorrectClient(clientNum);

	// 2.1) if client stars nums don't match, error and stop import
	if (!atCorrectClient) {
		// no error message here needed
		// TODO: send error back to bkg, stop import
		return;
	}

	// 2.2) no issues! get page's data using MESSAGE_SOURCE
	console.log('merge data:', data);
	debugger;
}

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"

// ================================================================
//                          PORT LISTENERS
// ================================================================

port.onMessage.addListener(function(msg) {
	const {
		code, clientNum, mergeData,
		autoImport, autoMerge
	} = msg;

    Utils_Log(MESSAGE_SOURCE, `port msg received`, msg);

    switch(code) {
        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            // if autoImport flag is true, start automatically!
            if (autoImport) {
				startImport( clientNum );
			}
			if (autoMerge) {
				console.log('TIME TO MERGE CBI');
				startMerge( clientNum, mergeData );
			}
			break;
			
		case PCs.BKG_CS_START_IMPORT:
		case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_CLIENT_BASIC_INFORMATION);
    }
});