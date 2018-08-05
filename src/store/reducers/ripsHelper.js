// rips page and field keys
import {
    RIPS_PAGE_KEYS as P_KEYS,
    RIPS_FIELD_KEYS as F_KEYS
} from '../../shared/rips/ripsFieldKeys';

/**
 * Function creates empty arrays next to each field name to make table populating
 * easy.
 * Example: Takes data like this:
 * ['FIRST_NAME', 'LAST_NAME', ...]
 * and turns it into something like this:
 * {
 *  'FIRST_NAME': ['', '', ''],
 *  'LAST_NAME': ['', '', ''], ...
 * }
 *
 * @param {object} fieldArr - array of RIPS fields
 * @param {number} numEmpty - number of empty slots to add next to each field
 * @returns converted array (see function description)
 */
const createEmptyData = (fieldArr, numEmpty) => {
    let container = {};

    // build array of empty strings, with length numEmpty
    const emptyStrArr = [...Array(numEmpty)]
        .map(_ => '');

    // map empty string arrays to each data category
    fieldArr.forEach(category => {
        container[category] = emptyStrArr
    });

    return container;
}

// destructure keys from F_KEYS so we don't have to do F_KEYS.FIRST_NAME, ...
const {
    // client basic information
    FIRST_NAME, LAST_NAME, PHONE_NUMBER, ADDRESS1, ADDRESS2, OTHER_PHONE_NUMBER,
    EMAIL_ADDRESS, UNHCR_NUMBER, DATE_OF_BIRTH, GENDER, NATIONALITY, COUNTRY_OF_ORIGIN,
    ETHNIC_ORIGIN, MAIN_LANGUAGE, SECOND_LANGUAGE, MARITAL_STATUS,
    // addresses (dynamic - TODO)

    // notes
    NOTES
    // TODO: add the rest here...

} = F_KEYS;

// TODO: replace test data with real data from background.js?
// create empty, initial data
export const sampleData = {
    // client basic information
    [P_KEYS.CLIENT_BASIC_INFORMATION]: createEmptyData([
        FIRST_NAME, LAST_NAME, PHONE_NUMBER, ADDRESS1, ADDRESS2, OTHER_PHONE_NUMBER,
        EMAIL_ADDRESS, UNHCR_NUMBER, DATE_OF_BIRTH, GENDER, NATIONALITY, COUNTRY_OF_ORIGIN,
        ETHNIC_ORIGIN, MAIN_LANGUAGE, SECOND_LANGUAGE, MARITAL_STATUS
    ], 3),

    // Addresses (dynamic - TODO)
    // [P_KEYS.ADDRESSES]: createEmptyData([ ... ]),

    // Notes
    [P_KEYS.NOTES]: createEmptyData([
        NOTES
    ]),

    // TODO: add the rest here...
};

// export default sampleData;