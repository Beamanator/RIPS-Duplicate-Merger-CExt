// destructure field keys
const {
    // client basic information
    FIRST_NAME, LAST_NAME, PHONE_NUMBER, ADDRESS1, ADDRESS2, OTHER_PHONE_NUMBER,
    EMAIL_ADDRESS, UNHCR_NUMBER, DATE_OF_BIRTH, GENDER, NATIONALITY,
    COUNTRY_OF_ORIGIN, ETHNIC_ORIGIN, MAIN_LANGUAGE, SECOND_LANGUAGE, MARITAL_STATUS,
    IMPORTANT_INFORMATION, URGENT_NOTES, APPOINTMENT_SLIP_NUMBER, CARITAS_NUMBER,
    CRS_NUMBER, IOM_NUMBER, MSF_NUMBER, STARS_STUDENT_NUMBER, RELIGION, UNHCR_STATUS,
    SOURCE_OF_REFERRAL, CITY_OR_VILLAGE_OF_ORIGIN, EMPLOYMENT_STATUS, NEIGHBORHOOD,
    HIGHEST_EDUCATION, CARE, CRS, EFRRA_OR_ACSFT, IOM, MSF, PSTIC, REFUGE_EGYPT,
    SAVE_THE_CHILDREN, UNICEF_OR_TDH, OTHER_SERVICE_PROVIDER,
    DATE_OF_ARRIVAL_IN_EGYPT, DATE_OF_UNHCR_REGISTRATION, RSD_DATE,
    LAST_RSD_UPDATE, // TODO: dynamic vulns
    VULNERABILITY_NOTES, FAMILY_SIZE, UNHCR_CASE_SIZE,
    DIRECT_BENEFICIARIES, INDIRECT_BENEFICIARIES,
    // addresses
    // TODO: dynamic from table - add to separate FIDs?
    // notes
    NOTES,
    // TODO: the rest... (aliases, relatives, contacts, etc...)

} = RIPS_FIELD_KEYS;

// destructure page key(s)
const { CLIENT_BASIC_INFORMATION } = RIPS_PAGE_KEYS;

// loosely based off RIPS Auto Import CExt
const FIELD_IDS_CLIENT_BASIC_INFORMATION = {
    [CLIENT_BASIC_INFORMATION]: {
        // ================== CURRENT CONTACT DETAILS: ==================
        // ------ TEXTBOXES: ------
        [FIRST_NAME]: 	'LFIRSTNAME',
		[LAST_NAME]: 	'LSURNAME',
        [PHONE_NUMBER]: 	'CDAdrMobileLabel',
        [ADDRESS1]: 			'LADDRESS1',
		[ADDRESS2]:				'LADDRESS2',
        [OTHER_PHONE_NUMBER]: 	'CDAdrTelLabel',
		[EMAIL_ADDRESS]: 		'CDLongField1',

        // ========================= BACKGROUND: ========================
        // ------ TEXTBOXES: ------
        [UNHCR_NUMBER]: 	'UNHCRIdentifier',

        // ------ DROPDOWNS: ------
        [DATE_OF_BIRTH]:	'LDATEOFBIRTH',
		[GENDER]: 			'LGENDER',
        [NATIONALITY]:		'LNATIONALITY',
        [COUNTRY_OF_ORIGIN]: 	'LCOUNTRYOFORIGIN',
        [ETHNIC_ORIGIN]: 		'LETHNICORIGIN',
        [MAIN_LANGUAGE]:	'LMAINLANGUAGE',
        [SECOND_LANGUAGE]: 		'LSECONDLANGUAGE',
        [MARITAL_STATUS]: 		'LMARITALSTATUS',
        
        // =================== IMPORTANT INFORMATION: ==================
        // ------ TEXTBOXES: ------
        [IMPORTANT_INFORMATION]: 'LIMPORTANTINFO',

        // ======================= URGENT NOTES: =======================
        // ------ TEXTBOXES: ------
        [URGENT_NOTES]:         'ClntPanic_PANIC_NOTES',

        // ==================== OTHER INFORMATION: =====================
        // ------ TEXTBOXES: ------
        [APPOINTMENT_SLIP_NUMBER]:	'CDIdentifier1',
		[CARITAS_NUMBER]:		'CDIdentifier2',
		[CRS_NUMBER]:			'CDIdentifier3',
		[IOM_NUMBER]: 			'CDIdentifier4',
		[MSF_NUMBER]:			'CDIdentifier5',
		[STARS_STUDENT_NUMBER]:	'CDIdentifier6',

        // ------ DROPDOWNS: ------
        [RELIGION]:				'Dropdown1',
		[UNHCR_STATUS]:			'Dropdown2',
		[SOURCE_OF_REFERRAL]: 	'Dropdown3',
		[CITY_OR_VILLAGE_OF_ORIGIN]: 		'Dropdown4',
		[EMPLOYMENT_STATUS]: 	'Dropdown5',
		[NEIGHBORHOOD]: 		'Dropdown6',
		[HIGHEST_EDUCATION]: 	'Dropdown7',

        // ------ CHECKBOXES: ------
        [CARE]: 		'IsCBLabel1',
		[CRS]: 			'IsCBLabel2',
		[EFRRA_OR_ACSFT]: 	'IsCBLabel3',
		[IOM]:			'IsCBLabel4',
		[MSF]:			'IsCBLabel5',
		[PSTIC]:		'IsCBLabel6',
		[REFUGE_EGYPT]:	'IsCBLabel7',
		[SAVE_THE_CHILDREN]:	'IsCBLabel8',
		[UNICEF_OR_TDH]: 			'IsCBLabel9',
		[OTHER_SERVICE_PROVIDER]:	'IsCBLabel10',

        // -------- DATES: --------
        [DATE_OF_ARRIVAL_IN_EGYPT]: 	'CDDateEntryCountryLabel',
		[DATE_OF_UNHCR_REGISTRATION]: 	'CDDateRegisteredLabel',
		[RSD_DATE]: 					'LRSDDATE',
        // [technically a dropdown]
        [LAST_RSD_UPDATE]:		'LPRIORITY',

        // ===================== VULNERABILITIES: ======================
        // ------ CHECKBOXES: -----
        // ... TODO: dynamic ...
        // ------ TEXTBOXES: ------
        [VULNERABILITY_NOTES]: 'DescNotes',

        // ======================== DEPENDENTS: ========================
        // ------ TEXTBOXES: ------
        [FAMILY_SIZE]: 			'CDDependentStatsLabel1',
        [UNHCR_CASE_SIZE]: 		'CDDependentStatsLabel2', // RLAP ONLY
        [DIRECT_BENEFICIARIES]:	'CDDependentStatsLabel3', // PS ONLY
        [INDIRECT_BENEFICIARIES]:	'CDDependentStatsLabel4', // PS ONLY
    },

    [PAGE_KEYS.ADDRESSES]: {
        // TODO: dynamic from table...
    },

    [PAGE_KEYS.NOTES]: {
        [NOTES]: 'FREE_NOTES',
    },
}