// destructure field keys
const {
    RELATIVES,

    // just field names (no selectors used / needed)
    REL_FIRST_NAME, REL_SURNAME,
    REL_RELATIONSHIP, REL_DOB, REL_STARS_NUMBER,

    // selectors for new relative form
    RELATIVE_NEW_BUTTON, REL_NEW_SAVE_BUTTON,
    REL_NEW_FIRST_NAME, REL_NEW_LAST_NAME,
    REL_NEW_DOB, REL_NEW_RELATIONSHIP,
    REL_NEW_STARS_NUMBER,

    // selectors for table elements
    REL_TABLE_HEADER_CELLS, REL_TABLE_BODY_ROWS,
    REL_TABLE_BODY_CELLS_FROM_ROWS
} = RIPS_FIELD_KEYS;

const FIELD_IDS_RELATIVES = {
    [REL_TABLE_HEADER_CELLS]:   '#gridContent table thead tr th',
    [REL_TABLE_BODY_ROWS]:      '#gridContent table tbody tr',
    [REL_TABLE_BODY_CELLS_FROM_ROWS]: 'td',

    [RELATIVE_NEW_BUTTON]:  'input#NewRelative',
    [REL_NEW_FIRST_NAME]:   'input#LRELATIVEFIRSTNAME',
    [REL_NEW_LAST_NAME]:    'input#LRELATIVESURNAME',
    [REL_NEW_DOB]:          'input#LRELATIVEDOB',
    [REL_NEW_RELATIONSHIP]: 'select#LRELATIVERELATIONSHIP',
    [REL_NEW_STARS_NUMBER]: 'input#NRU_NO_OF_DEPENDENT',
    [REL_NEW_SAVE_BUTTON]:  'button[value="Save"]'
}