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
            // TODO: throw error, stop the import - mapping failed
            const err = `Cell "${cellName}" failed to map!`;
            Utils_Error(MESSAGE_SOURCE, err);
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
            // add cell data (cell.innerText) to row object
            else {
                const cellData = cell.innerText;
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
    // TODO: here now chah??
    debugger;

    // first, get data existing on page
    const currentRelatives = getPageDataArr();
    // pull out relatives data
    const mRelativesData = mData[MESSAGE_SOURCE];

    // next, filter out existing addresses from merge data
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
    if (dataIndex > newRelatives.length - 1) {
        // TODO: add this in!
        // Utils_SendRedirectCode(port, '');
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

    // Wait till all of the 'new relative' fields are
    // -> displaying, then move forward
    Utils_WaitForCondition(
        Utils_OnAllElemsExist, {
            selectors: [
                relFirstName,
                relLastName,
                relDOB,
                relRelationship,
                relStarsNumber
            ]
        }, 500, 3
    )
    .then(() => {
        // 3) populate 'new address' form elements
        const [
            relFirstNameSelector, relLastNameSelector,
            relDOBSelector, relRelationshipSelector,
            relStarsNumberSelector
        ] = [
            FIELD_IDS_RELATIVES[REL_NEW_FIRST_NAME],
            FIELD_IDS_RELATIVES[REL_NEW_LAST_NAME],
            FIELD_IDS_RELATIVES[REL_NEW_DOB],
            FIELD_IDS_RELATIVES[REL_NEW_RELATIONSHIP],
            FIELD_IDS_RELATIVES[REL_NEW_STARS_NUMBER]
        ];

        const [
            relFirstNameElem, relLastNameElem,
            relDOBElem, relRelationshipElem,
            relStarsNumberElem
        ] = [
            document.querySelector(relFirstNameSelector),
            document.querySelector(relLastNameSelector),
            document.querySelector(relDOBSelector),
            document.querySelector(relRelationshipSelector),
            document.querySelector(relStarsNumberSelector)
        ];

        // all elems should exist since we got here :)
        relFirstNameElem.value = nextRelativeData[REL_FIRST_NAME] || '';
        relLastNameElem.value = nextRelativeData[REL_SURNAME] || '';
        relDOBElem.value = nextRelativeData[REL_DOB] || '';
        relRelationshipElem.value = nextRelativeData[REL_RELATIONSHIP] || '';
        relStarsNumberElem.value = nextRelativeData[REL_STARS_NUMBER] || '';

        // 4) update background.js' merge data index before clicking 'save'
        sendIncrementMergeDataIndex();

        // 5) Click 'save' (update next address index to add - in bkg.js)
        const relSaveBtnSelector = FIELD_IDS_RELATIVES[REL_NEW_SAVE_BUTTON];
        const relSaveBtnElem = document.querySelector(relSaveBtnSelector);
        // click save!
        debugger;
        // relSaveBtnElem.click();
        // -> now page will refresh, and incremented dataIndex will
        // -> make the next address import
    })
    .catch(errMsg => {
        // error if we didn't find all elements
        const err = `Some relative elem(s) not found! Check 'em!`;
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
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_RELATIVES);
    }
});