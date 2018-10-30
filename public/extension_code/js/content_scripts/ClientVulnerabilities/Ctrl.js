//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.CLIENT_VULNERABILITIES;
// ------- other globals -------
let vulns_analyzed = false;
let vulns_set = [];

// ===============================================================
//                          PORT CONNECT
// ===============================================================
// Note: not sure if this will work...
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_CLIENT_VULNERABILITIES });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startImport = () => {
    debugger;
}
// TODO: figure out how to deal with vulns
// pass = true;
// vulnsCheckboxes = document.querySelectorAll('input[id^="PostedVulDicts"]');
// vulnsCheckboxes.forEach(inputElem => {
// 	let labelElem = inputElem.nextElementSibling;

// 	// get attributes from input & label elems that should match
// 	const inputAttr = inputElem.getAttribute('id');
// 	const labelAttr = labelElem.getAttribute('for');
    
// 	// check the elements' attributes match (input's 'id' and label's 'for')
// 	if (inputAttr === labelAttr) {
// 		// get vuln title from label
// 		let vulnName = labelElem.innerText;

// 		// get true / false if checked or not
// 		let vulnChecked = inputElem.checked;

// 		// do something with name & checked
// 		console.log(vulnName, vulnChecked);
// 	}
// 	// if attributes don't match up, throw error!
// 	else {
// 		pass = false;
// 		let err = `input<${inputAttr}> and label<${labelAttr}> don't match :(`;
// 		// Utils_Error(MESSAGE_SOURCE, err);
// 	}
// });

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"
    
// ================================================================
//                          PORT LISTENERS
// ================================================================
// ================================================================
//                          PORT LISTENERS
// ================================================================

port.onMessage.addListener(msg => {
	const {
        code, // clientNum,
        mergeData,
		autoImport, autoMerge, // autoArchive,
		postSaveRedirectFlag, // postArchiveRedirectFlag,
	} = msg;

    Utils_Log(MESSAGE_SOURCE, `port msg received`, msg);

    switch(code) {
		case PCs.BKG_CS_INIT_PORT:
			Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
			
			// if save-redirect flag is set to true, we already saved,
			// -> so now we just have to redirect the user to the
			// -> next step!
			// if (postSaveRedirectFlag) {
			// 	Utils_SendRedirectCode(port, 'Addresses/Addresses');
			// 	return;
			// }
			// if archive-redirect flag is set to true, we already
			// -> archived, so now we should redirect back to
			// -> advanced search page
			if (postArchiveRedirectFlag) {
				Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
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
                    MESSAGE_SOURCE,
                    'Too many "auto start" flags are true!',
                    '[autoMerge, autoImport]:',
                    autoStartFlags
                );
                return;
            }
			
			// if any auto flag is true, start automatically!
            if (autoImport) { startImport(); }
			if (autoMerge) { startMerge( mergeData ); }
			// if (autoArchive) { ... } handled in CBI ctrl
			break;
        
        // -> these are already in CBI ctrl
		// case PCs.BKG_CS_START_IMPORT:
		// case PCs.BKG_CS_START_MERGE:
		// 	Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
        //     break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_CLIENT_VULNERABILITIES);
    }
});
