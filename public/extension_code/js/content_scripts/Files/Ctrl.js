//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.FILES;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_FILES });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startImport = () => {
    const files = [];
    const fileLinkSelector = FIELD_IDS_FILES[FILE_LINK];
    const fileLinkList = document.querySelectorAll(fileLinkSelector);

    fileLinkList.forEach(linkElem => {
        // get date modified element from file link element
        const dateModifiedElem =
            linkElem.parentElement.nextElementSibling;
        
        // (.trim() not needed since we don't use this data elsewhere)
        const fileName = linkElem.innerText;
        const dateModified = dateModifiedElem.innerText;
        
        files.push({
            [FILE_NAME]: fileName,
            [FILE_DATE_MODIFIED]: dateModified
        });
    });

    // data gathered, now send it back to background.js to store
    const fileData = { [FILES]: files }
    Utils_SendDataToBkg(port, MESSAGE_SOURCE, fileData);

    // redirect to next page (History - skip Private Files)
    Utils_SendRedirectCode(port, 'MatterAction/ActionHistoryList');
}

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"

// ================================================================
//                          PORT LISTENERS
// ================================================================

port.onMessage.addListener(msg => {
    // Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch ( msg.code ) {
        case PCs.BKG_CS_INIT_PORT:
            // Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            
            if (msg.autoMerge || msg.autoArchive) {
                let err = 'Files page should never be archiving or merging! ' +
                    'Something must be wrong. Stopping everything.'
                Utils_Error(MESSAGE_SOURCE, err)
                Utils_KillAll(port, MESSAGE_SOURCE, err);
            }
            // if autoImport flag is true, start automatically!
            else if (msg.autoImport) {
                startImport();
            }
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_CS_FILES);
    }
});