//--------------------------------------------------------------
//                           FUNCTIONS
//--------------------------------------------------------------


/**
 * Function converts month names into month numbers. Month names can either
 * be 3 letters (Ex: Jan, Mar, Sep...)
 * or full names (Ex: January, March, September...)
 * 
 * @param {string} month - 3 letter month, or full month name
 * @returns month number (Jan = 1, Sep = 9, etc...)
 */
function Utils_GetMonthNumberFromName( month ) {
	let monthTransObj = {
		'JAN': 1,	'JANUARY': 	1,
		'FEB': 2,	'FEBRUARY': 2,
		'MAR': 3,	'MARCH': 	3,
		'APR': 4,	'APRIL': 	4,
		'MAY': 5,
		'JUN': 6,	'JUNE': 	6,
		'JUL': 7,	'JULY': 	7,
		'AUG': 8,	'AUGUST': 	8,
		'SEP': 9,	'SEPTEMBER': 9, 'SEPT': 9,
		'OCT': 10,	'OCTOBER': 	10,
		'NOV': 11,	'NOVEMBER': 11,
		'DEC': 12,	'DECEMBER': 12
	};

	return monthTransObj[ month.toUpperCase() ];
}

/**
 * Returns a copy of the old object, with new properties from updatedProperties obj
 * @param {object} oldObject 
 * @param {object} updatedProperties 
 */
export const updateObject = (oldObject, updatedProperties) => {
    return {
        ...oldObject,
        ...updatedProperties
    };
};

/**
 * Checks validity of input value based on rules
 * @param {number || string} value 
 * @param {object} rules - array of rules 
 */
export const checkValidity = ( value, rules ) => {
    let isValid = true;

    if ( !rules ) {
        return true;
    }

    if (rules.required) {
        isValid = value.trim() !== '' && isValid;
    }

    if (rules.minLength) {
        isValid = value.length >= rules.minLength && isValid;
    }

    if (rules.maxLength) {
        isValid = value.length <= rules.maxLength && isValid;
    }

    if (rules.isEmail) {
        const pattern = /[a-z0-9]+(\.[a-z0-9])*@[a-z0-9-]+(\.[a-z])+/i;
        isValid = pattern.test(value) && isValid;
    }

    if (rules.isNumeric) {
        const pattern = /^\d+$/;
        isValid = pattern.test(value) && isValid;
    }

    return isValid;
}

/**
 * Helper function to sortStringArr - abstraction of the key array's reduce fn
 * @param {object} obj - accumulatory object
 * @param {string} key - name of key to look for in object
 */
const sortStringArrReduce = (obj, key) => {
    if (!obj[key]) {
        console.error(`<sortStringArr> key [${key}] not defined in:`, obj);
        return {};
    } else return obj[key];
}
/**
 * Sorts an array of strings - can search through objects if passing in keyArr
 * @param {object} strArr - array of strings / objects with strings
 * @param {object} [keyArr=[]] - array of keys to get to sort values (ex: ['username'])
 */
export const sortStringArr = (strArr, keyArr=[]) => {
    const newArr = [...strArr]; // create new copy of shell array

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    return newArr.sort((elemA, elemB) => {
        // get strings from object elems
        const strA = keyArr.reduce(sortStringArrReduce, elemA).toUpperCase();
        const strB = keyArr.reduce(sortStringArrReduce, elemB).toUpperCase();

        // console.log(elemA, elemB, strA, strB);
        
        if (strA > strB) {
            return 1;
        }
        if (strA < strB) {
            return -1;
        }
        return 0;
    });
}