//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.RELATIVES;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_RELATIVES });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const getPageDataArr = () => {
    const columnNames = [];
    const columnNameMap = {
        'First Name': REL_FIRST_NAME,
        'Surname': REL_SURNAME,
        'Relationship': REL_RELATIONSHIP,
        'Date of Birth': REL_DOB,
        'StARS No.': REL_STARS_NUMBER,
        '': ''
    }

    // populate column names array
    const tableHeaderCellsSelector =
        FIELD_IDS_RELATIVES[REL_TABLE_HEADER_CELLS];
    document.querySelectorAll(tableHeaderCellsSelector)
    .forEach(cell => {
        const cellName = cell.innerText.trim();
        
        // push all mapped column names to columnNames array
        const mappedName = columnNameMap[cellName];

        if (mappedName === undefined) {
            // throw error, stop the import - mapping failed
            const err = `Cell "${cellName}" failed to map! Ask dev to investigate.`;
            Utils_Error(MESSAGE_SOURCE, err);
            Utils_KillAll(port, MESSAGE_SOURCE, err);
        } else {
            columnNames.push(mappedName);
        }
    });

    // search through relative data and send to bkg
    const relatives = [];
    const tableBodyRowsSelector =
        FIELD_IDS_RELATIVES[REL_TABLE_BODY_ROWS];
    document.querySelectorAll(tableBodyRowsSelector)
    .forEach(row => {
        // make new objects for each row
        const relativeRowData = {};

        // get relative data from specific row
        const tableBodyCellsFromRowsSelector =
            FIELD_IDS_RELATIVES[REL_TABLE_BODY_CELLS_FROM_ROWS];
        row.querySelectorAll(tableBodyCellsFromRowsSelector)
        .forEach((cell, colIndex) => {
            // if there's no column name, skip this cell's data
            if (columnNames[colIndex] == '') {
                // do nothing - not a useful column
            }
            // add cell data to row object
            else {
                const cellData = cell.innerText.trim();
                const cellMapName = columnNames[colIndex];
                // map data to columnNameMap in row data obj
                relativeRowData[cellMapName] = cellData;
            }
        });
        
        // push row data onto relatives array
        relatives.push(relativeRowData);
    });

    // data gathered! return!
    return relatives;
}

const startImport = () => {
    // first, get page data
    const relativeData = {
        [RELATIVES]: getPageDataArr()
    };

    // send data to background.js
    Utils_SendDataToBkg(port, MESSAGE_SOURCE, relativeData);

    // redirect to next page (Contacts)
    Utils_SendRedirectCode(port, 'Contacts/Contacts');
}

const startMerge = ( mData, dataIndex ) => {
    // first, get data existing on page
    const currentRelatives = getPageDataArr();
    // pull out relatives data
    const mRelativesData = mData[MESSAGE_SOURCE];

    // next, filter out existing relatives from merge data
    const newRelatives = mRelativesData.filter(mRel => {
        // by default, relative is "new" / doesn't exist yet
        let relativeExists = false;

        // loop through current relatives on client
        currentRelatives.forEach(cRel => {
            // quit early if possible
            if (relativeExists) return;

            // by default, assume mRel and cRel match
            let relMatch = true;

            // loop through keys of currentRelatives to find
            // -> matching values
            Object.entries(cRel).forEach(([relKey, cRelVal]) => {
                // quit early if possible
                if (!relMatch) return;

                // if vals DON'T match, set 'relMatch' to false!
                if (mRel[relKey] !== cRelVal) {
                    relMatch = false;
                }
            });

            // if mRel matches cRel, set 'relativeExists' flag to true!
            if (relMatch) relativeExists = true;
        });

        // if relativeExists, return false (filter)
        // -> if doesn't exist, return true (don't filter)
        return !relativeExists;
    });

    // 1) get next relative to add to client
    let nextRelativeData = null;

    // if index is out of range, no more to add! redirect to next page!
    if (dataIndex >= newRelatives.length) {
        Utils_SendRedirectCode(port, 'Contacts/Contacts');
        return; // quit early
    }
    // else, not out of range, so set next relative data to save :)
    else {
        nextRelativeData = newRelatives[dataIndex];
    }

    // 2) Click "Add Relative" to open up form elements
    const newRelativeBtnSelector = FIELD_IDS_RELATIVES[RELATIVE_NEW_BUTTON];
    const newRelativeBtnElem = document.querySelector(newRelativeBtnSelector);
    newRelativeBtnElem.click();

    // 3) populate 'new relative' form elements
    const [
        relFirstNameSelector, relLastNameSelector,
        relDOBSelector, relRelationshipSelector,
        relStarsNumberSelector, relUnhcrNumberSelector
    ] = [
        FIELD_IDS_RELATIVES[REL_NEW_FIRST_NAME],
        FIELD_IDS_RELATIVES[REL_NEW_LAST_NAME],
        FIELD_IDS_RELATIVES[REL_NEW_DOB],
        FIELD_IDS_RELATIVES[REL_NEW_RELATIONSHIP],
        FIELD_IDS_RELATIVES[REL_NEW_STARS_NUMBER],
        FIELD_IDS_RELATIVES[REL_NEW_UNHCR_NUMBER]
    ];

    // Wait till all of the 'new relative' fields are
    // -> displaying, then move forward
    Utils_WaitForCondition(
        Utils_OnAllElemsExist, {
            selectors: [
                relFirstNameSelector,
                relLastNameSelector,
                relDOBSelector,
                relRelationshipSelector,
                relStarsNumberSelector,
                relUnhcrNumberSelector
            ]
        }, 500, 3
    )
    .then(() => {
        const [
            relFirstNameElem, relLastNameElem,
            relDOBElem, relRelationshipElem,
            relStarsNumberElem, relUnhcrNumberElem
        ] = [
            document.querySelector(relFirstNameSelector),
            document.querySelector(relLastNameSelector),
            document.querySelector(relDOBSelector),
            document.querySelector(relRelationshipSelector),
            document.querySelector(relStarsNumberSelector),
            document.querySelector(relUnhcrNumberSelector)
        ];

        // all elems should exist since we got here :)
        relFirstNameElem.value = nextRelativeData[REL_FIRST_NAME] || '';
        relLastNameElem.value = nextRelativeData[REL_SURNAME] || '';
        relDOBElem.value = nextRelativeData[REL_DOB] || '';
        relStarsNumberElem.value = nextRelativeData[REL_STARS_NUMBER] || '';
        // 'unhcr number' is required for some reason, so
        // -> populate with 'unknown'
        relUnhcrNumberElem.value = 'unknown';
        // 'relationship' is in a dropdown box, so needs to be
        // -> set in a different manner
        Object.entries(relRelationshipElem.options)
        .forEach(([value, optElem]) => {
            // once an option's text matches the value we're
            // -> looking for, that's our match!
            if (optElem.innerText.trim() === nextRelativeData[REL_RELATIONSHIP]) {
                relRelationshipElem.options[value].selected = 'selected';
            }
        });

        // 4) update background.js' merge data index before clicking 'save'
        sendIncrementMergeDataIndex();

        // 5) Click 'save' (update next rel index to add - in bkg.js)
        const relSaveBtnSelector = FIELD_IDS_RELATIVES[REL_NEW_SAVE_BUTTON];
        const relSaveBtnElem = Utils_QueryDoc(relSaveBtnSelector);
        // click save!
        relSaveBtnElem.click();
        // -> now page will refresh, and incremented dataIndex will
        // -> make the next relative import
    })
    .catch(errMsg => {
        // error if we didn't find all elements
        const err = `Some relative elem(s) not found! Check 'em!`;
        Utils_Error(MESSAGE_SOURCE, err);
        Utils_Error(MESSAGE_SOURCE, 'CBI ERROR:', errMsg);
        alert(
            'Warning: Your internet connection ' +
            'may be a little bit slow. Please refresh the page now.' +
            '\n\nIf this message shows up multiple times, please ' +
            'contact the developer (the RIPS guy). Thanks!' +
            '\n\nNote for the developer:\nError message: ' + errMsg
        );
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
    } = msg;
    
    // Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch ( code ) {
        case PCs.BKG_CS_INIT_PORT:
            // Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);

            // fail if multiple automatic triggers are true
            // -> (can't do > 1 thing at same time)
            if (autoImport && autoMerge) {
                let err = 'Auto import / merge are both true! This shouldnt be possible.';
                Utils_Error(MESSAGE_SOURCE, err);
                Utils_KillAll(port, MESSAGE_SOURCE, err)
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
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_RELATIVES);
    }
});