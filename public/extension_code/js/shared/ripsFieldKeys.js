// loosely based off RIPS Auto Import CExt

// field keys on each page
const RIPS_FIELD_KEYS = {
    // ================== CLIENT BASIC INFORMATION: ==================
    STARS_NUMBER:   'StARS Number',
    // ------ CURRENT CONTACT DETAILS: ------
    FIRST_NAME:     'First Name',
    LAST_NAME:      'Surname',
    PHONE_NUMBER:   'Phone Number',
    ADDRESS1:       'Address1',
    ADDRESS2:       'Address2',
    OTHER_PHONE_NUMBER: 'Other Phone Number',
    EMAIL_ADDRESS:  'Email Address',
    
    // ------ BACKGROUND: ------
    UNHCR_NUMBER:   'UNHCR Number', 
    DATE_OF_BIRTH:  'Date of Birth',
    GENDER:         'Gender',			
    NATIONALITY:    'Nationality',
    COUNTRY_OF_ORIGIN: 'Country of Origin',	
    ETHNIC_ORIGIN:  'Ethnic Origin',
    MAIN_LANGUAGE:  'Main Language',
    SECOND_LANGUAGE: 'Second Language',
    MARITAL_STATUS: 'Marital Status',

    // ------ IMPORTANT INFORMATION: ------
    IMPORTANT_INFORMATION: 'Important Information',

    // ------ URGENT NOTES: ------
    URGENT_NOTES:   'Urgent Notes',

    // ------ OTHER INFORMATION: ------
    APPOINTMENT_SLIP_NUMBER: 'Appointment Slip Number',
    CARITAS_NUMBER: 'Caritas Number',
    CRS_NUMBER:     'CRS Number',
    IOM_NUMBER:     'IOM Number',
    MSF_NUMBER:     'MSF Number',
    STARS_STUDENT_NUMBER: 'StARS Student Number',
    RELIGION:       'Religion',
    UNHCR_STATUS:   'UNHCR Status',
    SOURCE_OF_REFERRAL: 'Source of Referral',
    CITY_OR_VILLAGE_OF_ORIGIN: 'City / Village of Origin',
    EMPLOYMENT_STATUS: 'Employment Status',
    NEIGHBORHOOD:   'Neighborhood',
    HIGHEST_EDUCATION: 'Highest Education',
    CARE:       'CARE?',
    CRS:        'CRS?',
    EFRRA_OR_ACSFT: 'EFRRA/ACSFT?',
    IOM:        'IOM?',
    MSF:        'MSF?',
    PSTIC:      'PSTIC?',
    REFUGE_EGYPT: 'Refuge Egypt?',
    SAVE_THE_CHILDREN: 'Save the Children?',
    UNICEF_OR_TDH: 'UNICEF/TDH?',
    OTHER_SERVICE_PROVIDER: 'Other Service Provider',
    DATE_OF_ARRIVAL_IN_EGYPT: 'Date of Arrival in Egypt',
    DATE_OF_UNHCR_REGISTRATION: 'Date of UNHCR Registration',
    RSD_DATE:   'RSD Date',
    LAST_RSD_UPDATE: 'Last RSD Update',

    // ------ VULNERABILITIES: ------
    // TODO: dynamic checkboxes
    VULNERABILITY_NOTES: 'Vulnerability Notes',

    // ------ DEPENDENTS: ------
    FAMILY_SIZE: 'Family Sized',
    UNHCR_CASE_SIZE: 'UNHCR Case Size',
    DIRECT_BENEFICIARIES: 'Direct Beneficiaries',
    INDIRECT_BENEFICIARIES: 'Indirect Beneficiaries',

    // ====================== ADDRESSES: ======================
    // ------ table column names ------
    FIRST_ADDRESS_LINE: 'First Address Line',
    ADDRESS_TELEPHONE: 'Address Telephone',
    ADDRESS_DATE_FROM: 'Lived here "from"',
    ADDRESS_DATE_TO: 'Lived here "to"',

    // ------ dynamic fields for html table ------
    ADDRESS_TABLE_HEADER_CELL: 'ADDRESS_TABLE_HEADER_CELLS',
    ADDRESS_TABLE_BODY_ROWS: 'ADDRESS_TABLE_BODY_ROWS',
    ADDRESS_TABLE_BODY_CELLS_FROM_ROWS: 'ADDRESS_TABLE_BODY_CELLS_FROM_ROWS',
    
    // ======================== NOTES: ========================
    NOTES: 'Notes',
    
    // ====================== RELATIVES: ======================
    // ------ table column names ------
    REL_FIRST_NAME: 'First Name (Relative)',
    REL_SURNAME: 'Surname (Relative)',
    REL_RELATIONSHIP: 'Relationship to client',
    REL_DOB: 'Date of Birth',
    REL_STARS_NUMBER: 'StARS Number',

    // ------ dynamic fields for html table ------
    // TODO: combine with similar keys above (addresses)
    REL_TABLE_HEADER_CELL: 'REL_TABLE_HEADER_CELLS',
    REL_TABLE_BODY_ROWS: 'REL_TABLE_BODY_ROWS',
    REL_TABLE_BODY_CELLS_FROM_ROWS: 'REL_TABLE_BODY_CELLS_FROM_ROWS',
    
    // ======================= CONTACTS: ======================
    // ------ table column names ------
    CONTACT_FIRST_NAME: 'First Name (Contact)',
    CONTACT_SURNAME: 'Surname (Contact)',
    CONTACT_TYPE: 'Contact Type',
    // CONTACT_STARS_NUMBER: 'StARS Number',

    // ------ dynamic fields for html table ------
    // TODO: combine with similar keys above (addresses)
    CONTACT_TABLE_HEADER_CELL: 'CONTACT_TABLE_HEADER_CELLS',
    CONTACT_TABLE_BODY_ROWS: 'CONTACT_TABLE_BODY_ROWS',
    CONTACT_TABLE_BODY_CELLS_FROM_ROWS: 'CONTACT_TABLE_BODY_CELLS_FROM_ROWS',

    // =================== ADVANCED SEARCH: ===================
    SEARCH_CLIENT_NUMBER: 'SEARCH_CLIENT_NUMBER',
    SEARCH_BUTTON: 'SEARCH_BUTTON',

    // =============== ADVANCED SEARCH RESULTS: ===============
    SEARCH_RESULTS: 'SEARCH_RESULTS',
    ACTIVE_CLIENT: 'ACTIVE_CLIENT',
    TAB_CLIENT_BASIC_INFORMATION: 'TAB_CLIENT_BASIC_INFORMATION',

    // ======================= HISTORY: =======================
    ACTION_DATE: 'Action Date',
    ACTION_NAME: 'Action Name',
    ACTION_CASEWORKER: 'Action Caseworker',
    ACTION_NOTES: 'Action Notes',

    // ====================== ... ======================
    // TODO: add the rest here
}