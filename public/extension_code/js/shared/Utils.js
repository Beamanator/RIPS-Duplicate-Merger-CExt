//--------------------------------------------------------------
//     NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//--------------------------------------------------------------

// ==============================================================================
//                               CONSTANTS
// ==============================================================================
// const MESSAGE_SOURCE (set in individual Ctrl files)

// ==============================================================================
//                   WAIT-CONDITION (NON-PORT) FUNCTIONS
// ==============================================================================
/**
 * Function checks to make sure active client matches client being
 * imported into de-duplicator
 * 
 * @param {object} config - config holds active client selector + clientNum
 * @returns {boolean} - true if active client matches client being imported
 */
const Utils_OnActiveClientMatches = ( config ) => {
	const { activeClientSelector, clientNum } = config;
	const activeClientElem = document.querySelector(activeClientSelector);

	// if activeClientElem invalid, throw error
	if (!activeClientElem) {
		Utils_Error(
			MESSAGE_SOURCE,
			'active client elem not valid :( selector given:',
			activeClientSelector
		);
		return false;
	}

	// find where clientNum exists inside activeClientElem
	const matchLocation = activeClientElem.innerText
		.indexOf(clientNum);

	// if matchLocation is -1, not found! fail!
	return matchLocation !== -1;
}

const Utils_OnElemExists = ( config ) => {
	const { selector } = config;
	const htmlElem = document.querySelector(selector);

	// if element does not exist, return false!
	if (!htmlElem) return false;
	// else, just return true (woohoo!)
	else return true;
}

const Utils_OnAllElemsExist = ( config ) => {
	const { selectors } = config;
	let allExist = true;
	
	for (let i = 0; i < selectors.length; i++) {
		// try to get reference to element
		const htmlElem = document.querySelector(selectors[i]);

		// check if element does NOT exist, 
		if (!htmlElem) {
			allExist = false;
			break; // exit early
		}
	}
	// returns true if all elements exist, false otherwise
	return allExist;
}

const Utils_OnPopupNotThrown = ( config ) => {
	const { alertSelector, alertVisibleClass } = config;
	const alertElem = document.querySelector(alertSelector);

	// if alert elem not found, return true (non popup)
	if (!alertElem) return true;

	// get element's classes
	const alertClasses = alertElem.classList.value;

	// find if alertVisibleClass exists in class list
	const classLocation = alertClasses.indexOf(alertVisibleClass);

	// if classLocation is -1, not found! popup not thrown, success!
	return classLocation === -1;
}

const Utils_OnSelectOneElemHasSelectedOption = ( config ) => {
	const { selectElem } = config;

	// make sure element exists
	if (!selectElem) {
		Utils_Error(MESSAGE_SOURCE, 'Select Elem not found');
		return false;
	}

	// check if element type is correct
	if (selectElem.type !== 'select-one') {
		Utils_Error(MESSAGE_SOURCE, 'Elem not type "select-one"', selectElem);
		return false;
	}

	// get the 1 and only selected option
	const selectedOption = selectElem.selectedOptions[0];

	// fail if no selected option (yet) - should happen later right?
	if (!selectedOption) {
		Utils_Error(MESSAGE_SOURCE, 'No selected Option elem yet. Wait a bit more.');
		return false;
	}

	// return true IFF selected option has non-empty value!
	return selectedOption.value !== '';
}

const Utils_OnElemFoundWithCustomFunction = ( config ) => {
	const { selectorFn } = config;

	// make sure selector function IS a function
	if (typeof(selectorFn) !== 'function') {
		Utils_Error(MESSAGE_SOURCE, 'Given selector function is not a ' +
			'function, but a ' + typeof(selectorFn));
		return false;
	}

	// return true / false which should come from the selector function
	return selectorFn();
}

/**
 * Function handles multiple wrapped conditions for
 * Utils_WaitForCondition, returns true if ALL true,
 * false otherwise.
 * 
 * @param {array} FconditionParamArray - Array of functions to check true / false
 * @returns {boolean} - true if all Fconditions true, false otherwise
 */
const Utils_WrapMultiConditions = ( FconditionParamArray, time, iter ) => {
	let promiseArr = [];

	// loop through array, calling each function
	FconditionParamArray.forEach(([Fcondition, params]) => {
		promiseArr.push(
			Utils_WaitForCondition(Fcondition, params, time, iter)
		);
	});

	// return outcome of all promises
	return Promise.all(promiseArr);
}

/**
 * Function returns a promise that gets resolved whenever a specified function
 * returns true. Caller passes in a function and possibly a number (time between
 * intervals)
 * Note: Comes from Auto Import CExt
 * 
 * @param {function} Fcondition - function / condition that must eventually return true
 * @param {object} params - array or object of parameters to pass to Fcondition
 * @param {number} [time=1000] - time between each interval call (in ms)
 * @param {number} [iter=5] - number of iterations allowed before rejecting
 * @returns {object} - Promise  - resolve when Fcondition returns true
 * 								- reject if iterates more than iter variable w/out success
 */
function Utils_WaitForCondition( Fcondition, params, time = 1000, iter = 5 ) {
	return new Promise((resolve, reject) => {
		let count = 0;
		
		const intervalID = setInterval(() => {
			count++;
			
			// check if condition is true YET
			if ( Fcondition(params) ) {
				clearInterval(intervalID);
				resolve();
			}

			// check if we've passed the desired amount of iterations on setInterval
			else if (count > iter) {
				clearInterval(intervalID);
				reject(`Condition <${Fcondition.name}> never returned true over ` +
					`${iter} checks, spaced by ${time}ms.`);
			}

			// else, keep waiting & checking!
			else {}
		}, time);
	});
}

// ==============================================================================
//                          ERROR HANDLER FUNCTIONS
// ==============================================================================
const Utils_Log = (source, ...args) => console.log(source, ':', ...args);
const Utils_Warn = (source, ...args) => console.warn(source, ':', ...args);
const Utils_Error = (source, ...args) => console.error(source, ':', ...args); 

// ==============================================================================
//                          MESSAGE POSTING FUNCTIONS
// ==============================================================================
// Note: port codes come from "../../shared/portCodes.js"
const Utils_SendPortCodeError = (port, invalidCode, source='unknown') => {
	// handle unknown port
	if (!port) {
		const msg = `Could not send message about invalid code <${invalidCode}>.` +
			' Port not connected. Source: ' + source;
		return Utils_Error('UTILS', msg);
	}
	port.postMessage({
        code: PCs.CS_BKG_ERROR_CODE_NOT_RECOGNIZED, source: source,
        data: `Port code <${invalidCode}> not recognized!`
    });
};

const Utils_SendRedirectCode = (port, urlPart='unknown') => {
	if (!port) {
		const msg = `Could not redirect to urlPart <${urlPart}> - port not connected`;
		return Utils_Error('UTILS', msg);
	}
    port.postMessage({
        code: PCs.CS_BKG_PAGE_REDIRECT,
        urlPart: urlPart
    });
}

const Utils_SendDataToBkg = (port, source="unknkown", data) => {
	if (!port) {
		const msg = `Could not send data from <${source}> - port ` +
			'not connected.';
		return Utils_Error('UTILS', msg);
	}
	port.postMessage({
		code: PCs.CS_BKG_DATA_RECEIVED,
		source: source,
		data: data
	});
}

const Utils_KillAll = (port, source="unknown", error) => {
	if (!port) {
		const msg = `Error occurred in <${source}> - see message...`;
		return Utils_Error('UTILS', msg, error);
	}
	port.postMessage({
		code: PCs.CS_BKG_KILL_ALL,
		source: source,
		error: error,
	});
}

// ==============================================================================
//                       ELEM QUERY / SET FUNCTIONS
// ==============================================================================
/* document query functions (basic) */
const Utils_QueryDoc = (selector) => document.querySelector(selector);
const Utils_QueryDocA = (selector) => document.querySelectorAll(selector);

/**
 * Sets an 'option' on a 'select-one' element
 * @param {*} Elem 
 * @param {*} valToMatch 
 */
const Utils_SetSelectOneElem = (Elem, valToMatch) => {
    // TODO: throw error if Elem isn't 'select-one'?
	let success = false;

    // throw error if either param doesn't exist :(
    if (!Elem || !valToMatch) {
        const errMsg = `Error! no Elem <${Elem}> or val to match` +
            ` <${valToMatch}>`;
        Utils_Error(MESSAGE_SOURCE, errMsg);
        return false;
	}

    // loop through Select elem's entries
    Object.entries(Elem.options).forEach(([value, optElem]) => {
        // quit looping early if possible
        if (success) return;
        // once an option's text matches the value we're
        // -> looking for, that's our match!
        if (optElem.innerText.trim() === valToMatch) {
            Elem.options[value].selected = 'selected';
            success = true;
        }
	});
	
	// if data set is successful AND elem has an 'onchange' event
	// -> set, trigger 'change' event and dispatch to element
	if (success && Elem.attributes.onchange) {
		Elem.dispatchEvent(new Event('change'));
	}

    return success;
}

/**
 * Adds data to an 'input' element
 * @param {*} Elem 
 * @param {*} valToSet 
 */
const Utils_SetInputElem = (Elem, valToSet) => {
    // TODO: throw error if Elem isn't an 'input'
    // throw error if either param doesn't exist :(
    if (!Elem || !valToSet) {
        const errMsg = `Warning! no Elem <${Elem}> or val to set` +
            ` <${valToMatch}>`;
        Utils_Error(MESSAGE_SOURCE, errMsg);
        return false;
    }

    // loop through Input elem's entries
    Elem.value = valToSet;

    return true;
}

/**
 * Clicks a given element, as long as it exists
 * @param {*} Elem 
 */
const Utils_ClickElem = (Elem) => {
    // throw error if either param doesn't exist :(
    if (!Elem) {
        const errMsg = `Warning! no Elem <${Elem}> to click!`;
        Utils_Error(MESSAGE_SOURCE, errMsg);
        return false;
    }

    // click the element now :)
    Elem.click();

    return true;
}