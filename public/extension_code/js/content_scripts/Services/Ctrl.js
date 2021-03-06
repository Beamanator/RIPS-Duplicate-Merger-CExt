//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.SERVICES;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_SERVICES });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startMerge = (mHistData) => {
    // if there are no actions to add, something went wrong!
    // -> we should be here (see startMerge() in Services Ctrl.js)
    if (!mHistData || mHistData.length == 0) {
        const failErr = 'Error: At this point, we should have at least' +
            ' one action in \'mHistData\' variable.';
        Utils_Error(MESSAGE_SOURCE, failErr, mHistData);
        Utils_KillAll(port, MESSAGE_SOURCE, failErr);
        return;
    }

    const actionsWithServicesToCreate = [];
    const servicesDescriptionColumnIndex = 2; // 3rd column in table
    
    // populate column names array
    const tableHeaderCellsSelector =
        FIELD_IDS_SERVICES[SERVICES_TABLE_HEADER_CELL_LINKS];
    const servicesDescriptionColText =
        Utils_QueryDocA(tableHeaderCellsSelector)
        [servicesDescriptionColumnIndex].innerText.trim();
    
    // if 3rd column [index 2] doesn't match 'services description'
    // -> something is unexpected so stop!
    if (servicesDescriptionColText !== 'Services Description') {
        const errMsg = 'somehow column 3 (index 2) isn\t "Services' +
            ' Description" as expected... Fix index maybe?';
        Utils_Error(MESSAGE_SOURCE, errMsg);
        Utils_KillAll(port, MESSAGE_SOURCE, errMsg);
        return;
    }

    // now we know 3rd column [2] is Services Description, so loop
    // -> through merge history data, looking for matching service
    // -> descriptions!
    mHistData.forEach(mAction => {
        // action's service is same as 'service description' in table
        const mServiceDescription = mAction[ACTION_SERVICE];

        // by default assume no match
        let serviceMatch = false;

        // get table row selector
        const tableBodyRowsSelector =
            FIELD_IDS_SERVICES[SERVICES_TABLE_BODY_ROWS];
        // loop through rows to try try to match service descriptions
        Utils_QueryDocA(tableBodyRowsSelector).forEach(row => {
            // quit early if possible
            if (serviceMatch) return;

            // get selector for individual cells
            const tableBodyCellsFromRowsSelector =
                FIELD_IDS_SERVICES[SERVICES_TABLE_BODY_CELLS_FROM_ROWS];
            const currentServiceDescription =
                row.querySelectorAll(tableBodyCellsFromRowsSelector)
                [servicesDescriptionColumnIndex].innerText.trim();

            // now check if 'current' description matches 'merge''s!
            if (currentServiceDescription == mServiceDescription) {
                serviceMatch = true;
            }
        });

        // if serviceMatch is false, no match has happened so we need to add!
        if (!serviceMatch) {
            actionsWithServicesToCreate.push(mAction);
        }
    });

    // Narrow down actionsWithServicesToCreate to data that needs to
    // -> be added. Loop through actionsWithServicesToCreate,
    // -> adding data for each service only ONCE and taking care
    // -> to add data from earliest action
    const container = {};
    actionsWithServicesToCreate.forEach(action => {
        const associatedService = action[ACTION_SERVICE];
        
        // 1) add action details to container, if doesn't exist
        if (!container[associatedService]) {
            container[associatedService] = action;
            return;
        }

        // 2) make sure service date is the earliest date
        // 2.1) get current action's date (convert to d/m/y)
        const [aMonthNum, aDayNum, ...aDateOther] = action[ACTION_DATE].split('/');
        const aDateStr = [aDayNum, aMonthNum, ...aDateOther].join('/');
        // 2.2) get service container's date (convert to d/m/y)
        const [sMonthNum, sDayNum, ...sDateOther] = 
            container[associatedService][ACTION_DATE].split('/');
        const sDateStr = [sDayNum, sMonthNum, ...sDateOther].join('/');
        // 2.3) compare dates and set earliest in container
        if (new Date(aDateStr) < new Date(sDateStr)) {
            // could explicitly set date / caseworker, but easier to
            // -> just change the entire action obj (action name or
            // -> notes may change, but that doesn't matter)
            container[associatedService] = action;
        } // else {} //-> else don't change anything
    });

    // convert service container into an array of services
    const servicesFromContainer = [];
    for (let serviceKey in container) {
        // get data at current container key (service description)
        const serviceData = container[serviceKey];
        // push that obj to new array container
        servicesFromContainer.push(serviceData);
    }

    // now send these services to bkg to store, then to create!
    if (servicesFromContainer.length > 0) {
        // store, then get 'New' button and click it!
        // -> NOTE: only save 1 service b/c newService ctrl will
        // -> save that service, then return here. FOllowing that,
        // -> this ctrl will just store the next, then the next,
        // -> until there are no more services to add, and will
        // -> redirect to 'Add Action'
        sendServiceToCreate(servicesFromContainer[0]);

        // click button!
        const createServiceSelector = FIELD_IDS_SERVICES[SERVICE_CREATE_NEW];
        const clickSuccess = Utils_ClickElem(
            Utils_QueryDoc(createServiceSelector)
        );
        // handle click fail
        if (!clickSuccess) {
            let errMsg = `Couldn't click save somehow! ` +
                `<${createServiceSelector}>`;
            Utils_Error(MESSAGE_SOURCE, errMsg);
            Utils_KillAll(port, MESSAGE_SOURCE, errMsg);
        }
    }
    // else just redirect to view actions page since services
    // -> exist already! We don't need to create any services!
    else {
        Utils_SendRedirectCode(port, 'MatterAction/MatterActionsList');
    }
}

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"
const sendServiceToCreate = ( serviceData ) => {
    port.postMessage({
        code: PCs.CS_BKG_ADD_MISSING_SERVICES,
        data: serviceData
    });
}

// ================================================================
//                          PORT LISTENERS
// ================================================================
port.onMessage.addListener(msg => {
    const {
        code,
        mergeHistoryData,
        autoImport, autoMerge,
    } = msg;

    // Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch ( code ) {
        case PCs.BKG_CS_INIT_PORT:
            // Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            
            // auto import should never be true here...
            if (autoImport) {
                const err = 'Somehow got here & auto import is set?' +
                    ' How?!? Shouldn\t happen!!';
                Utils_Error(MESSAGE_SOURCE, err);
                Utils_KillAll(port, MESSAGE_SOURCE, err)
            }
            // if merge flag is true, start automatically!
            // -> Note: redirecting handled within the startMerge function
            else if (autoMerge) { startMerge( mergeHistoryData ); }
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_SERVICES);
    }
});