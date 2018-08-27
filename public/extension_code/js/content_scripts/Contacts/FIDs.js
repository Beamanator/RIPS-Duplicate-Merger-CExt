// destructure field keys
const {
    CONTACTS,
    // just field names (no selectors used / needed)
    CONTACT_FIRST_NAME, CONTACT_SURNAME,
    CONTACT_TYPE,
    // CONTACT_STARS_NUMBER,

    // selectors needed for table elements
    CONTACT_TABLE_HEADER_CELLS, CONTACT_TABLE_BODY_ROWS,
    CONTACT_TABLE_BODY_CELLS_FROM_ROWS
} = RIPS_FIELD_KEYS;

const FIELD_IDS_CONTACTS = {
    [CONTACT_TABLE_HEADER_CELLS]: '#gridContent table thead tr th',
    [CONTACT_TABLE_BODY_ROWS]: '#gridContent table tbody tr',
    [CONTACT_TABLE_BODY_CELLS_FROM_ROWS]: 'td',
}