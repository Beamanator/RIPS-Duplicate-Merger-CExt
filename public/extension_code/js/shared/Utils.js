//--------------------------------------------------------------
//     NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//--------------------------------------------------------------

// /**
//  * Function tells background.js to stop the auto import function via
//  * action 'stopped_via_msg', and passes a message to background.js, then
//  * the chrome runtime callback to caller
//  * 
//  * @param {string} message - message to pass to background.js
//  * @param {function} callback - chrome runtime callback sent to caller. if not given,
//  *                              defaults to console.error() fn
//  */
// function Utils_StopImport( message, callback ) {}


// /**
//  * Function navigates import to specific RIPS tab by clicking on the anchor with
//  * specified href / URL
//  * 
//  * Called by: CtrlAdvancedSearch.js, MainController.js, CtrlServices
//  * 
//  * @param {string} tab_href - url piece that is contained within an anchor tag on the
//  *                            left-hand navigation menu
//  */
// function Utils_NavigateToTab( tab_href ) {
// 	if ( tab_href !== undefined)
// 		$('a[href="' + tab_href + '"]')[0].click();
// 	else
// 		console.warn('Utils_NavigateToTab received invalid tab href');
// }

// /**
//  * Function converts passed-in tab name to url piece that RIPS holds as a
//  * location for each tab in navigation menu (left panel)
//  * 
//  * @param {string} tabName - name of tab you want url piece for 
//  * @returns tab's href (location) - (or undefined if tabName is incorrect)
//  */
// function Utils_GetTabHref( tabName ) {}

// /**
//  * Function gets current page url (using jQuery) and returns it.
//  * 
//  * Called by: MainController.js
//  * 
//  * @returns gurrent page's url [as string]
//  */
// function Utils_GetPageURL() {
// 	return $(location).attr('href');
// }

// /**
//  * Function takes a URL as an input and returns a 'url piece' as output. This output
//  * is the last two slices of a URL (a slice is some text between '/' characters)
//  * -> example: 'Registration/Registration'
//  * 
//  * If url doesn't have '/' characters, returns url
//  * 
//  * Called by: MainController.js, Utils.js
//  * 
//  * @param {string} url a full URL
//  * @returns {string} 'urlslice1/urlslice2' - the final 2 slices of a url
//  */
// function Utils_GetUrlPiece( url ) {}

// /**
//  * Function checks if a given piece of a URL is contained within the current page's
//  * url string.  
//  * 
//  * Called By: CtrlAdvancedSearch.js
//  * 
//  * @param {string} urlPiece checks if this piece is within the current page url
//  * @param {boolean} [throwErr=true] if true, throw error if urlPiece not found in url
//  * @returns {boolean} true / false depending on if urlPiece is contained within current url
//  */
// function Utils_UrlContains(urlPiece, throwErr=true) {}

// /**
//  * Function adds error to chrome store (handled by options.js)
//  * 
//  * @param {string} message - error message to send to options.js
//  * @param {function} callback - (optional) callback function after error is thrown
//  */
// function Utils_AddError( message, callback ) {}

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
			'UTILS',
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

// ==============================================================================
//                        MAIN (NON-PORT) FUNCTIONS
// ==============================================================================
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