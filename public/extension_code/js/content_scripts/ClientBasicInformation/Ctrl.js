//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.CLIENT_BASIC_INFORMATION;
// message_source_v only used to send vulns to bkg.js in new table
const MESSAGE_SOURCE_V = RIPS_PAGE_KEYS.CLIENT_VULNERABILITIES;

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
	const starsNumElem = Utils_QueryDoc(starsNumFieldSelector);
	const starsNum = starsNumElem.value;
	
	// if client stars nums match, return true!
	if (starsNum === clientNum) {
		return true;
	}
	// -> else, throw error and return false
	else {
		const err = 'ERR: Somehow got to CBI page of wrong client!! ' +
			`Given StARS number <${starsNum}/${clientNum}> doesn\'t match!`;
		Utils_Error(MESSAGE_SOURCE, err);
		return false;
	}
}

const importVulnData = () => {
	let pass = true;
	let vulnData = {};

	// get selector & all checkbox elements
	const vulnCheckboxesSelector = FIELD_IDS_CLIENT_BASIC_INFORMATION[VULNERABILITY_CHECKS];
	const vulnCheckboxElems = Utils_QueryDocA(vulnCheckboxesSelector);
	
	// loop through all checkbox elems, getting labels & checked statuses
	vulnCheckboxElems.forEach(inputElem => {
		let labelElem = inputElem.nextElementSibling;

		// get attributes from input & label elems that should match
		const inputAttr = inputElem.getAttribute('id');
		const labelAttr = labelElem.getAttribute('for');
		// get vuln name from label elem
		const vulnName = labelElem.innerText;
		
		// check the elements' attributes match (input's 'id' and label's 'for')
		if (inputAttr === labelAttr) {
			// get true / false if checked or not
			const vulnChecked = inputElem.checked;

			// add vuln name & checked status to vuln container
			vulnData[vulnName] = vulnChecked;
		}
		// if attributes don't match up, throw error!
		else {
			pass = false;
			const err = `input<${inputAttr}> and label<${labelAttr}> ` +
				`don't match on vuln<${vulnName}> :(`;
			Utils_Warn(MESSAGE_SOURCE_V, err);
		}
	});

	// get vulnerability notes
	const vulnNotesSelector = FIELD_IDS_CLIENT_BASIC_INFORMATION[VULNERABILITY_NOTES];
	const vulnNotesElem = Utils_QueryDoc(vulnNotesSelector);

	// add vuln notes to vuln data obj
	vulnData[VULNERABILITY_NOTES] = vulnNotesElem.value.trim();

	// return vulnerability data & import success flag (pass)
	return [vulnData, pass];
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
	const fieldsToSkip = [
		STARS_NUMBER, SAVE_BUTTON_CBI, ARCHIVE_CLIENT_BUTTON,
		VULNERABILITY_CHECKS, VULNERABILITY_NOTES, VULNERABILITY_LABELS
	];
	const data = Object.entries(FIELD_IDS_CLIENT_BASIC_INFORMATION)
		// convert field selectors to their field values
		.reduce((container, [key, selector]) => {
			// short-circuit below logic if fatal error found before
			if (!allPass) return container;

			// skip fields that aren't necessary
			if (fieldsToSkip.includes(key)) return container;

			const elem = Utils_QueryDoc(selector);
			// TODO: stop import if elem is null
			if (!elem) {
				let err = 'ERR: Elem not found with selector: ' + selector;
				Utils_Error(MESSAGE_SOURCE, err);
				allPass = false;
				return '';
			}
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

	// get client's vuln data too :)
	let [vulnData, vulnPass] = importVulnData();
	if (!vulnPass) allPass = false;

	// if everything passes successfully, move on :)
	if (allPass) {
		// 3) data gathered, now send it back to background.js to store
		Utils_SendDataToBkg(port, MESSAGE_SOURCE, data);
		Utils_SendDataToBkg(port, MESSAGE_SOURCE_V, vulnData);
	
		// 4) redirect to next page
		Utils_SendRedirectCode(port, 'Addresses/Addresses');
		// Note: no need to handle "no vuln / dependent data" popup
		// -> warning since redirect skips that check
	}
	// else, throw error and stop import here :(
	else {
		let newMsg = 'Import failed - check other errors!';
		Utils_Error(MESSAGE_SOURCE, newMsg);
	}
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

	// 2.2) no issues! get page's basic data using MESSAGE_SOURCE
	const basicMergeData = mData[MESSAGE_SOURCE] || [];
	const vulnMergeData = mData[MESSAGE_SOURCE_V] || [];

	// if both arrs are empty, skip lower logic, move to next page
	if (basicMergeData.length + vulnMergeData.length == 0) {
		Utils_SendRedirectCode(port, 'Addresses/Addresses');
		return;
	}

	// assume all pass by default
	let allPass = true;

	// 3.1) loop through basic merge data, adding each field to the page
	basicMergeData.forEach(fieldObj => {
		// each obj in CBI page should only contain 1 field, so take
		// -> first element in the Object.entries array
		const [fieldKey, fieldValue] = Object.entries(fieldObj)[0];
		// get selector from field_ids container
		const fieldSelector = FIELD_IDS_CLIENT_BASIC_INFORMATION[fieldKey];
		// get element
		const elem = Utils_QueryDoc(fieldSelector);
		// TODO: stop import if elem is null
		if (!elem) {
			let err = 'ERR: Elem not found with selector: ' + fieldSelector;
			Utils_Error(MESSAGE_SOURCE, err);
			allPass = false;
			return '';
		}

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
					Utils_Error(MESSAGE_SOURCE, err);
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
					if (optElem.innerText.trim() === fieldValue) {
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

	debugger;
	// get all vulnerability labels - to search through later
	const vulnLabelsSelector = FIELD_IDS_CLIENT_BASIC_INFORMATION[VULNERABILITY_LABELS];
	const vulnLabelElems = Utils_QueryDocA(vulnLabelsSelector);

	// 3.2) loop through vuln merge data, checking / unchecking all boxes
	vulnMergeData.forEach(vulnObj => {
		// each obj only has 1 field, so take first elem
		const [vulnKey, vulnValue] = Object.entries(vulnObj)[0];

		// by default, say we haven't found the vuln yet
		let found = false;
		
		// search all vuln label elems for this vuln!
		vulnLabelElems.forEach(labelElem => {
			// quit early if possible
			if (found) return;

			// get actual inner text (vuln name) of this label
			const thisLabelText = labelElem.innerText;
			
			// if they match, get input elem, then check / uncheck it!
			if (thisLabelText === vulnKey) {
				found = true;

				// get vuln's input / checkbox element
				let vulnInputElem = labelElem.previousElementSibling;
				
				// check / uncheck the vuln!
				if (vulnValue === 'checked') {
					vulnInputElem.checked = true;
				} else if (vulnValue === 'not checked') {
					vulnInputElem.checked = false;
				} else {
					const err = 'ERR: Checkbox value is invalid! ' +
						'not sure what to do! Value: ' + vulnValue;
					Utils_Error(MESSAGE_SOURCE_V, err);
					allPass = false;
				}
			}
		})
	});

	// throw error and don't continue if some error happened before!
	if (!allPass) {
		const warn = 'WARN: Somehow we didn\'t pass our previous ' +
			'goals! Check other err messages!';
		Utils_Warn(MESSAGE_SOURCE_V, warn);
		return;
	}

	// click save, after making sure the input button exists!
	const saveSelector = FIELD_IDS_CLIENT_BASIC_INFORMATION[SAVE_BUTTON_CBI];
	// add a bit of waiting time (2 seconds) for Validation Extension to work
	// -> its magic and create the new save button :)
	Utils_WaitForCondition(
        Utils_OnElemExists, {
            selector: saveSelector
        }, 500, 4
    )
    .then(() => {
		// tell background it's time to move to the next page
		sendPostSaveFlag();
		
		// save button exists, so get it and click it!
		// -> (Note: clicking save keeps us on the same page)
		const saveButton = document.querySelector(saveSelector);
		saveButton.click();

		// will have to redirect after save is done
		// -> handled in `.onMessage` listener (bottom of file)
    })
    .catch(errMsg => {
		// TODO: stop merge w/ error message!
		// if button doesn't exist, RUN FOR YOU LIVES!! (this probably
		// -> means the Validation Extension isn't installed... ugh)
		const err = 'ERR: Cannot find save button, meaning you ' +
			'PROBABLY don\'t have the Validation extension instal' +
			'led!! Shame on you!! Quitting now!';
		Utils_Error(MESSAGE_SOURCE, err);
        Utils_Error(MESSAGE_SOURCE, 'CBI ERROR:', errMsg);
    });
};

const startArchive = ( clientNum ) => {
	// 1) check if we're looking at the correct client
	const atCorrectClient = checkViewingCorrectClient(clientNum);

	// 2.1) if client stars nums don't match, error and stop import
	if (!atCorrectClient) {
		// no error message here needed
		// TODO: send error back to bkg, stop archiving
		return;
	}

	// set 'archiveReady' flag or something in bkg.js to prep
	// -> for redirect after archive's page reload
	sendPostArchiveFlag();

	// NEXT: we're at the correct client, so now click Archive and wait!
	const archiveBtnSelector = FIELD_IDS_CLIENT_BASIC_INFORMATION[ARCHIVE_CLIENT_BUTTON];
	
	// click it!
	const archiveClickSuccess = Utils_ClickElem(
		Utils_QueryDoc(archiveBtnSelector)
	);

	// if click is successful, send message to increment client index
	if (archiveClickSuccess) sendArchiveNextClient();

	// after click, wait 30 seconds (30,000 ms)
	// -> if nothing happens, throw error! Tell user to refresh?
	const timeMs = 30000; // 30 seconds
	setInterval((...params) => {
		// if we're here, that means 'timeMs' has passed. This is bad
		// -> b/c we should have redirected (after client was archived)
		// -> so throw error - warn user to refresh!
		let errMsg = 'Still sitting on Client Basic Information page! ' +
			'Page should have refreshed after "Archive" was clicked! ' +
			'Click "Archive" to get the processing moving!!';
		Utils_Error(MESSAGE_SOURCE, errMsg);
		// TODO: maybe send to React as well?
	}, timeMs);
}

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"
const sendPostSaveFlag = () => {
	port.postMessage({
		code: PCs.CS_BKG_POST_SAVE_REDIRECT
	});
};
const sendPostArchiveFlag = () => {
	port.postMessage({
		code: PCs.CS_BKG_POST_ARCHIVE_REDIRECT
	});
};
const sendArchiveNextClient = () => {
	port.postMessage({
		code: PCs.CS_BKG_ARCHIVE_NEXT_CLIENT
	});
};

// ================================================================
//                          PORT LISTENERS
// ================================================================

port.onMessage.addListener(msg => {
	const {
		code, clientNum, mergeData,
		autoImport, autoMerge, autoArchive,
		postSaveRedirectFlag, postArchiveRedirectFlag,
	} = msg;

    Utils_Log(MESSAGE_SOURCE, `port msg received`, msg);

    switch(code) {
		case PCs.BKG_CS_INIT_PORT:
			Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
			
			// if save-redirect flag is set to true, we already saved,
			// -> so now we just have to redirect the user to the
			// -> next step!
			if (postSaveRedirectFlag) {
				Utils_SendRedirectCode(port, 'Addresses/Addresses');
				return;
			}
			// if archive-redirect flag is set to true, we already
			// -> archived, so now we should redirect back to
			// -> advanced search page
			if (postArchiveRedirectFlag) {
				Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
				return;
			}

			// count how many 'auto...' flags are true
            const autoStartFlags = [autoMerge, autoImport, autoArchive];
            const countAutoStarts = autoStartFlags
                .reduce((count, flag) => count + (flag ? 1 : 0), 0);

            // fail if multiple automatic triggers are true
            // -> (can't do > 1 thing at same time)
            if (countAutoStarts > 1) {
                Utils_Error(
                    MESSAGE_SOURCE,
                    'Too many "auto start" flags are true!',
                    '[autoMerge, autoImport, autoArchive]:',
                    autoStartFlags
                );
                return;
            }
			
			// if any auto flag is true, start automatically!
            if (autoImport) { startImport( clientNum ); }
			if (autoMerge) { startMerge( clientNum, mergeData ); }
			if (autoArchive) { startArchive( clientNum ); }
			break;
			
		case PCs.BKG_CS_START_IMPORT:
		case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_CLIENT_BASIC_INFORMATION);
    }
});