//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.NOTES;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_NOTES });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startImport = () => {
    // get notes from html
    const notesSelector = FIELD_IDS_NOTES[NOTES];
    const notesElem = document.querySelector(notesSelector);
    const notesData = {
        [NOTES]: notesElem.value
    };

    // data gathered, now send it back to background.js to store
    Utils_SendDataToBkg(port, MESSAGE_SOURCE, notesData);

    // redirect to next page (Relatives - skipping Aliases)
    Utils_SendRedirectCode(port, 'Relatives/Relatives');
}

const startMerge = (mData) => {
    // get this page's merge data
    const pageMergeData = mData[MESSAGE_SOURCE];

    // if data is empty, probably selected client #1 notes
    // -> (or none) so just redirect to next page (relatives)
    if (pageMergeData.length == 0) {
        Utils_SendRedirectCode(port, 'Relatives/Relatives');
        return;
    }

    const notesBoxSelector = FIELD_IDS_NOTES[NOTES];
    const notesBoxElem = document.querySelector(notesBoxSelector);

    if (!notesBoxElem) {
        let errMsg = NOTES + ' not found from selector: ' +
            notesBoxSelector;
        Utils_Error(MESSAGE_SOURCE, errMsg);
        Utils_KillAll(port, MESSAGE_SOURCE, errMsg);
        return;
    }

    // only 1 item in "notes" page data, so let's not get fancy
    notesBoxElem.value = pageMergeData[0][NOTES];

    // now get to the save button!
    const notesSaveSelector = FIELD_IDS_NOTES[NOTES_SAVE_BUTTON];
    const notesSaveElem = document.querySelector(notesSaveSelector);

    if (!notesSaveElem) {
        let errMsg = NOTES_SAVE_BUTTON + ' not found from selector: ' +
            notesSaveSelector;
        Utils_Error(MESSAGE_SOURCE, errMsg);
        Utils_KillAll(port, MESSAGE_SOURCE, errMsg);
        return;
    }

    // tell background it's time to move to the next page
    sendPostSaveFlag();

    // click it! save it!
    notesSaveElem.click();
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

// ================================================================
//                          PORT LISTENERS
// ================================================================
port.onMessage.addListener(msg => {
    const {
        code, mergeData,
        autoImport, autoMerge,
        postSaveRedirectFlag
    } = msg;

    // Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch ( code ) {
        case PCs.BKG_CS_INIT_PORT:
            // Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            
            // if flag is set to true, we already saved, so now we just
			// -> have to redirect the user to the next step!
			if (postSaveRedirectFlag) {
				Utils_SendRedirectCode(port, 'Relatives/Relatives');
				return;
            }
            
            // fail if multiple automatic triggers are true
            // -> (can't do > 1 thing at same time)
            if (autoImport && autoMerge) {
                let err = 'Auto import / merge are both true! Something is wrong.';
                Utils_Error(MESSAGE_SOURCE, err);
                Utils_KillAll(port, MESSAGE_SOURCE, err);
                return;
			}

            // if any auto flag is true, start automatically!
            if (autoImport) { startImport(); }
            if (autoMerge) { startMerge( mergeData ); }
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_NOTES);
    }
});