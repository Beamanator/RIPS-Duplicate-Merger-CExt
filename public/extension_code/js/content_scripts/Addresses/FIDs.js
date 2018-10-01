// destructure field keys
const {
    ADDRESSES,

    // just field names (no selectors used / needed)
    FIRST_ADDRESS_LINE, ADDRESS_TELEPHONE,
    ADDRESS_DATE_FROM, ADDRESS_DATE_TO,

    // selectors for new address form
    ADDRESS_NEW_BUTTON,
    ADDRESS_NEW_LINE1, ADDRESS_NEW_PHONE, ADDRESS_NEW_DATE_FROM,
    ADDRESS_NEW_DATE_TO, ADDRESS_NEW_SAVE_BUTTON,

    // selectors for table elements
    ADDRESS_TABLE_HEADER_CELLS, ADDRESS_TABLE_BODY_ROWS,
    ADDRESS_TABLE_BODY_CELLS_FROM_ROWS
} = RIPS_FIELD_KEYS;

const FIELD_IDS_ADDRESSES = {
    [ADDRESS_TABLE_HEADER_CELLS]:   '#gridContent table thead tr th',
    [ADDRESS_TABLE_BODY_ROWS]:      '#gridContent table tbody tr',
    [ADDRESS_TABLE_BODY_CELLS_FROM_ROWS]: 'td',

    [ADDRESS_NEW_BUTTON]:       '#NewAddress',
    [ADDRESS_NEW_LINE1]:        'input#ADDR1',
    [ADDRESS_NEW_PHONE]:        'input#TELEPHONE',
    [ADDRESS_NEW_DATE_FROM]:    'input#DATE_FROM',
    [ADDRESS_NEW_DATE_TO]:      'input#DATE_UNTIL',
    [ADDRESS_NEW_SAVE_BUTTON]:  'input[value="Save"]',
}