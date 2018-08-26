// destructure field keys
const {
    // just field names (no selectors used / needed)
    FIRST_ADDRESS_LINE, ADDRESS_TELEPHONE,
    ADDRESS_DATE_FROM, ADDRESS_DATE_TO,

    // selectors needed for table elements
    ADDRESS_TABLE_HEADER_CELLS, ADDRESS_TABLE_BODY_ROWS,
    ADDRESS_TABLE_BODY_CELLS_FROM_ROWS
} = RIPS_FIELD_KEYS;

const FIELD_IDS_ADDRESSES = {
    [ADDRESS_TABLE_HEADER_CELLS]: '#gridContent table thead tr th',
    [ADDRESS_TABLE_BODY_ROWS]: '#gridContent table tbody tr',
    [ADDRESS_TABLE_BODY_CELLS_FROM_ROWS]: 'td',
}