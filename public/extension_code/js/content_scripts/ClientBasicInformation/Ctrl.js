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
	const starsNumElem = document.querySelector(starsNumFieldID);
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