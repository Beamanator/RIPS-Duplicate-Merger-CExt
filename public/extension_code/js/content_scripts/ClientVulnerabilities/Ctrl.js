//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                      CONSTANTS / GLOBALS
// ===============================================================
const MESSAGE_SOURCE2 = RIPS_PAGE_KEYS.CLIENT_VULNERABILITIES;
// ------- other globals -------
// let vulns_analyzed = false; // declared in client basic info ctrl
let vulns_set = [];

// ===============================================================
//                          PORT CONNECT
// ===============================================================
// Note: not sure if this will work...
const port2 = chrome.runtime.connect({ name: PCs.PORTNAME_CS_CLIENT_VULNERABILITIES });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startImport2 = () => {
    debugger;
	let pass = true;
	let vulnData = {};

	// get selector & all checkbox elements
	const vulnCheckboxesSelector = FIELD_IDS_CLIENT_VULNERABILITIES[VULNERABILITY_TYPES];
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
			Utils_Warn(MESSAGE_SOURCE2, err);
		}
	});

	// if pass was successful, 
	if (pass) {
		// vulns_analyzed = true;
		// TODO: send vulnData to bkg?
		Utils_SendDataToBkg(port2, MESSAGE_SOURCE2, vulnData);
	}
	// otherwise, set another error, saying to look at previous
	// -> mismatching vuln checkboxes / labels
	else {
		const err = 'Vulnerability import unsuccessful! Check above for errors';
		Utils_Error(MESSAGE_SOURCE2, err);
	}
}

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port2 codes come from "../js/portCodes.js"

// ================================================================
//                          PORT LISTENERS
// ================================================================

port2.onMessage.addListener(msg => {
	const {
        code, // clientNum,
        mergeData,
		autoImport, autoMerge, // autoArchive,
		postSaveRedirectFlag, postArchiveRedirectFlag,
	} = msg;

    Utils_Log(MESSAGE_SOURCE2, `port2 msg received`, msg);

    switch(code) {
		case PCs.BKG_CS_INIT_PORT:
			Utils_Log(MESSAGE_SOURCE2, `Successfully connected to background.js`);
			
			// if save-redirect flag or archive-redirect flag are set
			// -> to true, we already saved / archived the client,
			// -> so now just wait for cbi ctrl to handle next step!
			if (postSaveRedirectFlag || postArchiveRedirectFlag) {
				// cbi ctrl will do stuff...
				return;
			}

			// count how many 'auto...' flags are true
            const autoStartFlags = [autoMerge, autoImport];
            const countAutoStarts = autoStartFlags
                .reduce((count, flag) => count + (flag ? 1 : 0), 0);

            // fail if multiple automatic triggers are true
            // -> (can't do > 1 thing at same time)
            if (countAutoStarts > 1) {
                Utils_Error(
                    MESSAGE_SOURCE2,
                    'Too many "auto start" flags are true!',
                    '[autoMerge, autoImport]:',
                    autoStartFlags
                );
                return;
            }
			
			// if any auto flag is true, start automatically!
            if (autoImport) { startImport2(); }
			if (autoMerge) { startMerge2( mergeData ); }
			// if (autoArchive) { ... } handled in CBI ctrl
			break;
        
		case PCs.BKG_CS_START_IMPORT:
		case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port2, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port2, code, PCs.PORTNAME_CS_CLIENT_VULNERABILITIES);
    }
});
