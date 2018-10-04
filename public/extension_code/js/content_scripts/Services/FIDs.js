// destructure field keys
const {
    // just field names (no selectors used / needed)
    SERVICE_IS_LIVE, SERVICE_DESCRIPTION,
    SERVICE_CASEWORKER,

    // action name is same as service description on this page
    ACTION_SERVICE,

    // other selectors
    SERVICE_CREATE_NEW,

    // selectors needed for table elements
    SERVICES_TABLE_HEADER_CELL_LINKS, SERVICES_TABLE_BODY_ROWS,
    SERVICES_TABLE_BODY_CELLS_FROM_ROWS
} = RIPS_FIELD_KEYS;

// loosely based off RIPS Auto Import CExt
const FIELD_IDS_SERVICES = {
    [SERVICES_TABLE_HEADER_CELL_LINKS]:
        '#gridContent table thead tr th a',
    [SERVICES_TABLE_BODY_ROWS]: '#gridContent table tbody tr',
    [SERVICES_TABLE_BODY_CELLS_FROM_ROWS]: 'td',

    [SERVICE_CREATE_NEW]: 'input#NewServices'
}