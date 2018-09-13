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

const startMerge = (clientNum, mData) => {
	// 1) check if we're looking at the correct client
	const atCorrectClient = checkViewingCorrectClient(clientNum);

	// 2.1) if client stars nums don't match, error and stop import
	if (!atCorrectClient) {
		// no error message here needed
		// TODO: send error back to bkg, stop import
		return;
	}

	// 2.2) no issues! get page's data using MESSAGE_SOURCE
	const pageMergeData = mData[MESSAGE_SOURCE];

	// 3) loop through data, adding each field to the page
	pageMergeData.forEach(fieldObj => {
		// each obj in CBI page should only contain 1 field, so take
		// -> first element in the Object.entries array
		const [fieldKey, fieldValue] = Object.entries(fieldObj)[0];
		// get selector from field_ids container
		const fieldSelector = FIELD_IDS_CLIENT_BASIC_INFORMATION[fieldKey];
		// get element
		const elem = document.querySelector(fieldSelector);

		// handle html types differently
		switch(elem.type) {
			case 'text':
			case 'textarea':
				elem.value = fieldValue;
				break;

			case 'checkbox':
				if (fieldValue === 'checked') {
					elem.checked = true;
				} else if (fieldValue === 'not checked') {
					elem.checked = false;
				} else {
					const err = 'ERR: Checkbox value is invalid! ' +
						'not sure what to do! Value: ' + fieldValue +
						', selector: ' + fieldSelector;
					Utils_Error(err);
					allPass = false;
				}
				break;

			case 'select-one':
				let matchFound = false;
				// convert options obj to array
				Object.entries(elem.options)
				// loop through elem's options
				.forEach(([optVal, optElem]) => {
					// once an option's text matches the value we're looking for,
					// -> set it as selected! 
					if (optElem.innerText === fieldValue) {
						elem.options[optVal].selected = 'selected';
						matchFound = true;
					}
				});
				// if no match found during loop, don't continue past the page!
				if (!matchFound) {
					const err = 'ERR: No matching option elem found ' +
						'for selector: ' + fieldSelector;
					Utils_Error(MESSAGE_SOURCE, err);
					allPass = false;
				}
				break;
			
			default:
				const err = 'ERR: Found an unhandled html elem ' +
					'type while merging client data! Stopping ' +
					' merge here - ' + fieldSelector;
				Utils_Error(MESSAGE_SOURCE, err);
				allPass = false;
		}
	});

	console.log('at this point, all data should be updated!');
	// TODO: make sure vuln data is imported at this point ;)
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