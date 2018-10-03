//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.CONTACTS;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_CONTACTS });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const getPageDataArr = () => {
    const columnNames = [];
    const columnNameMap = {
        'First Name': CONTACT_FIRST_NAME,
        'Surname': CONTACT_SURNAME,
        'Contact Type': CONTACT_TYPE,
        'StARS No.': '',
        '': ''
    }

    // populate column names array
    const tableHeaderCellsSelector =
        FIELD_IDS_CONTACTS[CONTACT_TABLE_HEADER_CELLS];
    document.querySelectorAll(tableHeaderCellsSelector)
    .forEach(cell => {
        const cellName = cell.innerText.trim();
        
        // push all mapped column names to columnNames array
        const mappedName = columnNameMap[cellName];

        if (mappedName === undefined) {
            // TODO: throw error, stop the import - mapping failed
            const err = `Cell "${cellName}" failed to map!`;
            Utils_Error(MESSAGE_SOURCE, err);
        } else {
            columnNames.push(mappedName);
        }
    });

    // search through contact data and send to bkg
    const contacts = [];
    const tableBodyRowsSelector =
        FIELD_IDS_CONTACTS[CONTACT_TABLE_BODY_ROWS];
    document.querySelectorAll(tableBodyRowsSelector)
    .forEach(row => {
        // make new objects for each row
        const contactRowData = {};

        // get contact data from specific row
        const tableBodyCellsFromRowsSelector =
            FIELD_IDS_CONTACTS[CONTACT_TABLE_BODY_CELLS_FROM_ROWS];
        row.querySelectorAll(tableBodyCellsFromRowsSelector)
        .forEach((cell, colIndex) => {
            // if there's no column name, skip this cell's data
            if (columnNames[colIndex] == '') {
                // do nothing - not a useful column
            }
            // add cell data (cell.innerText) to row object
            else {
                const cellData = cell.innerText;
                const cellMapName = columnNames[colIndex];
                // map data to columnNameMap in row data obj
                contactRowData[cellMapName] = cellData;
            }
        });
        
        // push row data onto contacts array
        contacts.push(contactRowData);
    });

    // return gathered data!
    return contacts;
}

const startImport = () => {
    // first, get page data
    const contactData = {
        [CONTACTS]: getPageDataArr()
    };

    // now send it back to background.js to store
    Utils_SendDataToBkg(port, MESSAGE_SOURCE, contactData);

    // redirect to next page (Files)
    Utils_SendRedirectCode(port, 'FilesUpload/FilesUpload');
}

const startMerge = ( mData, dataIndex ) => {
    // first, get data existing on page
    const currentContacts = getPageDataArr();
    // pull out contacts data
    const mContactsData = mData[MESSAGE_SOURCE];
    
    // next, filter out existing contacts from merge data
    const newContacts = mContactsData.filter(mCon => {
        // by default, contact is "new" / doesn't exist yet
        let contactExists = false;

        // loop through current Contacts on client
        currentContacts.forEach(cCon => {
            // quit early if possible
            if (contactExists) return;

            // by default, assume mCon and cCon match
            let conMatch = true;

            // loop through keys of currentContacts to find
            // -> matching values
            Object.entries(cCon).forEach(([conKey, cConVal]) => {
                // quit early if possible
                if (!conMatch) return;

                // if vals DON'T match, set 'conMatch' to false!
                if (mCon[conKey] !== cConVal) {
                    conMatch = false;
                }
            });

            // if mCon matches cCon, set 'contactExists' flag to true!
            if (conMatch) contactExists = true;
        });

        // if contactExists, return false (filter)
        // -> if doesn't exist, return true (don't filter)
        return !contactExists;
    });

    // 1) get next contact to add to client
    let nextContactData = null;

    // if index is out of range, no more to add! redirect to next page!
    if (dataIndex >= newContacts.length) {
        // skip file upload b/c that has to be done manually
        // Utils_SendRedirectCode(port, 'FilesUpload/FilesUpload');

        // instead, go to history page
        Utils_SendRedirectCode(port, 'MatterAction/ActionHistoryList');
        return; // quit early
    }
    // else, not out of range, so set next contact data to save :)
    else {
        nextContactData = newContacts[dataIndex];
    }

    // 2) Click "Add Contact" to open up form elements
    const newContactBtnSelector = FIELD_IDS_CONTACTS[CONTACT_NEW_BUTTON];
    const newContactBtnElem = document.querySelector(newContactBtnSelector);
    newContactBtnElem.click();

    // 3) populate 'new contact' form elements
    const [
        contactFirstNameSelector, contactLastNameSelector,
        contactTypeSelector
    ] = [
        FIELD_IDS_CONTACTS[CONTACT_NEW_FIRST_NAME],
        FIELD_IDS_CONTACTS[CONTACT_NEW_LAST_NAME],
        FIELD_IDS_CONTACTS[CONTACT_NEW_TYPE]
    ];

    // Wait till all of the 'new contact' fields are
    // -> displaying, then move forward
    Utils_WaitForCondition(
        Utils_OnAllElemsExist, {
            selectors: [
                contactFirstNameSelector,
                contactLastNameSelector,
                contactTypeSelector
            ]
        }, 500, 3
    )
    .then(() => {
        const [
            contactFirstNameElem, contactLastNameElem,
            contactTypeElem
        ] = [
            document.querySelector(contactFirstNameSelector),
            document.querySelector(contactLastNameSelector),
            document.querySelector(contactTypeSelector)
        ];

        // all elems should exist since we got here :)
        contactFirstNameElem.value = nextContactData[CONTACT_FIRST_NAME] || '';
        contactLastNameElem.value = nextContactData[CONTACT_SURNAME] || '';
        // 'contact type' is in a dropdown box, so needs to be
        // -> set in a different manner
        Object.entries(contactTypeElem.options)
        .forEach(([value, optElem]) => {
            // once an option's text matches the value we're
            // -> looking for, that's our match!
            if (optElem.innerText.trim() === nextContactData[CONTACT_TYPE]) {
                contactTypeElem.options[value].selected = 'selected';
            }
        });

        // 4) update background.js' merge data index before clicking 'save'
        sendIncrementMergeDataIndex();

        // 5) Click 'save' (update next contact index to add - in bkg.js)
        const contactSaveBtnSelector = FIELD_IDS_CONTACTS[CONTACT_NEW_SAVE_BUTTON];
        const contactSaveBtnElem = document.querySelector(contactSaveBtnSelector);
        // click save!
        contactSaveBtnElem.click();
        // -> now page will refresh, and incremented dataIndex will
        // -> make the next contact import
    })
    .catch(errMsg => {
        // error if we didn't find all elements
        const err = `Some contact elem(s) not found! Check 'em!`;
        Utils_Error(MESSAGE_SOURCE, err);
        Utils_Error(MESSAGE_SOURCE, 'CBI ERROR:', errMsg);
    });
}

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"
const sendIncrementMergeDataIndex = () => {
	port.postMessage({
		code: PCs.CS_BKG_INCREMENT_MERGE_DATA_INDEX
	});
};

// ================================================================
//                          PORT LISTENERS
// ================================================================

port.onMessage.addListener(msg => {
    const {
        code, mergeData, mergeDataIndex,
        autoImport, autoMerge,
        // postSaveRedirectFlag
    } = msg;

    Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch ( code ) {
        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);

            // if flag is set to true, we already saved, so now we just
			// -> have to redirect the user to the next step!
			// if (postSaveRedirectFlag) {
			// 	Utils_SendRedirectCode(port, 'Relatives/Relatives');
			// 	return;
            // }

            // fail if multiple automatic triggers are true
            // -> (can't do > 1 thing at same time)
            if (autoImport && autoMerge) {
                Utils_Error(MESSAGE_SOURCE, 'Auto import / merge are both true! :(');
                return;
			}

            // if any auto flag is true, start automatically!
            if (autoImport) { startImport(); }
            if (autoMerge) { startMerge( mergeData, mergeDataIndex ); }
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_CONTACTS);
    }
});