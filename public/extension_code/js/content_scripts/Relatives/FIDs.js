// destructure field keys
const {
    // just field names (no selectors used / needed)
    REL_FIRST_NAME, REL_SURNAME,
    REL_RELATIONSHIP, REL_DOB, REL_STARS_NUMBER,

    // selectors needed for table elements
    REL_TABLE_HEADER_CELLS, REL_TABLE_BODY_ROWS,
    REL_TABLE_BODY_CELLS_FROM_ROWS
} = RIPS_FIELD_KEYS;

const FIELD_IDS_RELATIVES = {
    [REL_TABLE_HEADER_CELLS]: '#gridContent table thead tr th',
    [REL_TABLE_BODY_ROWS]: '#gridContent table tbody tr',
    [REL_TABLE_BODY_CELLS_FROM_ROWS]: 'td',
}