/**
 * Function converts raw passed-in data to a flat array that can be easily
 * used by the component.
 * Example: Takes data like this:
 * {
 *  'FIRST_NAME': ['', '', ''],
 *  'LAST_NAME': ['', '', ''],
 *  ...
 * }
 * and turns it into something like this:
 * [
 *  ['FIRST_NAME', '', '', ''],
 *  ['LAST_NAME', '', '', ''], ...
 * ]
 *
 * @param {object} rawData - js object holding raw data
 * @param {string} key - data key
 * @param {string} type - options: 'basic' or 'lists', describing
 *                        type of data table to format
 * @param {function} errorHandler - error handler function
 */
export const formatRawData = (rawData, key, type="basic", errorHandler) => {
    // set default console error function
    if (!errorHandler) errorHandler = (msg) => console.error('ERROR: ', msg);

    // throw error if data is empty
    if (!rawData || Object.keys(rawData).length === 0) {
        let msg = `rawData with key <${key}> is empty!`;
        errorHandler(msg);
        return [];
    }

    if (type === "basic") {
        // get array of Obj's props in raw data
        return Object.entries( rawData )
        // add raw data arrays to category / field name / data key
        .map(dataCategory => {
            const dataKey = dataCategory[0];
            let data = dataCategory[1];

            // destructure vars from final .reduce function
            const { pass: dataTypesMatch, dataType } =
            // convert data elements into their native "types"
            data.map(e => typeof(e))
            // remove undefined elements (typeof(undefined) is "undefined")
            .filter(type => type !== 'undefined')
            // pass if defined data's types are all the same!
            .reduce((container, dataType) => {
                // if type hasn't been set, set dataType
                if (!container.dataType) {
                    return {
                        pass: container.pass,
                        dataType: dataType
                    }
                }
                // dataType has ben set - only pass if current
                // -> dataType matches old dataType
                else {
                    return {
                        pass: dataType === container.dataType,
                        dataType: container.dataType
                    }
                }
            }, { pass: true, dataType: '' });
            
            // If not all elements have same data type (or are undefined),
            // -> something probably went wrong. Throw error.
            if (!dataTypesMatch) {
                let err = dataKey + ' has mismatched data types' +
                    ' in data array! why?? fix this!';
                errorHandler(err, dataCategory);
                // add errors to output
                return [dataKey, ...data.map(e => 'ERROR')]
            }
            // else, all dataTypes are the same! onward!
            else {
                // depending on the type, return different data
                switch(dataType) {
                    case 'string': // do nothing, just display data!
                        break;
                    case 'number': // do nothing, except add "confused" warning
                        errorHandler('Huh? How is there a "number" dataType?', 'warn');
                        break;
                    case 'object':
                        // throw warning if it's an object, not array :D
                        if (Array.isArray(data[0])) {
                            console.warn(
                                'UNSURE HOW TO HANDLE THESE OBJECTS!',
                                'Should they be Arrays? Hmmmm...'
                            );
                        } else {
                            // arrays will be handled later - at the end
                            // -> of this handling function. So skip
                            // -> processing now
                            return dataCategory;
                        }
                        break;
                    case 'boolean':
                        // for checkboxes. turn 'true' into 'checked', false
                        // -> into 'not checked'
                        data = data.map(e => e ? 'checked' : 'not checked');
                        break;
                    case 'undefined': // all undefined - these will get
                        // -> filtered out later - don't worry now
                        break;
                    default:
                        errorHandler(
                            'How did we get here?? Data doesnt match' +
                            ' any expected values somehow...',
                            dataKey, dataType
                        );
                }
                // finally, return the new array format
                return [dataKey, ...data]
            }
        })
        // filter -> hide data field if specific conditions are met
        .filter(dataField => {
            // make array holding 'blank' values (0 and false are not blank
            // -> since they are valid numbers / boolean values)
            const blankTypes = [undefined, null, ''];
            
            // filter condition - returns true iff ALL params are
            // -> undefined, null, or blank strings
            const condition_allBlank = (a, b, c) =>
                blankTypes.includes(a) &&
                blankTypes.includes(b) &&
                blankTypes.includes(c);

            // filter condition - returns true iff ALL params are
            // -> same (or just a, b if c is blank - not empty string)
            const condition_allSame = (a, b, c) =>
                (c === undefined || c === null)
                    ? a === b
                    : a === b && b === c;

            // filter based on applied conditions
            return !condition_allBlank(
                dataField[1], dataField[2], dataField[3]
            ) && !condition_allSame(
                dataField[1], dataField[2], dataField[3]
            );
        });
    }
    // handle arrays of arrays
    else if (type === 'lists') {
        let runningTotal = 0, numClients = null;

        return Object.entries(
            // get array of Obj's props in raw data
            // -> (CONTACTS, FILES, action1, action2, etc...)
            Object.entries(rawData)
            // don't worry about keys (page names / categories),
            // -> just process inner data container objects
            // -> (outer obj keys - Notes, action1, action2, etc...)
            .reduce((output, [_, data_container], container_index) => {
                // calculate # of clients by size of data_container
                if (!numClients) numClients = data_container.length;
                // if inconsistent number of clients found, throw err
                else if (numClients !== data_container.length) {
                    let errMsg = `Somehow found one container with size: ${numClients}, ` +
                        `and one with size: ${data_container.length} - which is right?`;
                    errorHandler(errMsg);
                    errorHandler(data_container);
                    return {};
                }

                // create array that holds all indices of matching client data
                let matchIndexHolder = [[], [], []];

                // this should not be possible... throw error
                if (numClients < 2 || numClients > 3) {
                    let errMsg = 'Whaat? Somehow we got an invalid # of clients: ' + numClients;
                    errorHandler(errMsg);
                    return {};
                }
                // if arrays for client 1 or 2 are blank (or if there's 3 clients
                // -> but the 3rd elem is blank), no all-client matches
                // -> are possible, so skip checks! move on to adding unique vals
                else if (
                    data_container[0] == null ||
                    data_container[1] == null ||
                    (
                        data_container[2] == null &&
                        numClients === 3
                    )
                ) {}
                // check if there's matching data b/w clients 1, 2, and 3
                else {
                    // extract client data to make things readable
                    let c1Data = data_container[0];
                    let c2Data = data_container[1];
                    let c3Data = data_container[2];

                    // loop through client 1's data, searching for
                    // -> exact matches in other clients' data
                    c1Data.forEach((c1obj, c1i) => {
                        let c1index = c1i;
                        let match2 = false, c2index;
                        let match3 = false, c3index;

                        // search for matches in client 2
                        c2Data.forEach((c2obj, c2i) => {
                            if (match2) return; // quit early if prev match2 found

                            // assume all props match by default
                            let allPropsMatch = true;

                            // loop through all props of c2obj, trying to match
                            // -> to props in c1obj
                            for (let c2prop in c2obj) {
                                // if values don't match, fail
                                if (c2obj[c2prop] !== c1obj[c2prop]) {
                                    allPropsMatch = false;
                                    break;
                                }
                            }

                            // if all props match, set 'match2' and client 2 index
                            if (allPropsMatch) {
                                match2 = true;
                                c2index = c2i;
                            }
                        });

                        // search for matches in client 3 (if numClients === 3)
                        if (numClients === 3) {
                            c3Data.forEach((c3obj, c3i) => {
                                if (match3) return; // quit early if prev match3 found
    
                                // assume all props match by default
                                let allPropsMatch = true;
    
                                // loop through all props of c3obj, trying to match
                                // -> to props in c1obj
                                for (let c3prop in c3obj) {
                                    // if values don't match, fail
                                    if (c3obj[c3prop] !== c1obj[c3prop]) {
                                        allPropsMatch = false;
                                        break;
                                    }
                                }

                                // if all props match, set 'match3' and client3 index
                                if (allPropsMatch) {
                                    match3 = true;
                                    c3index = c3i;
                                }
                            });
                        }

                        // if 2 clients & match found...
                        if (numClients === 2 && match2) {
                            // add matching c1 and c2 indices to match index holder
                            matchIndexHolder[0].push(c1index);
                            matchIndexHolder[1].push(c2index);
                        }
                        // if 3 clients & ALL matches found...
                        else if (numClients === 3 && match2 && match3) {
                            matchIndexHolder[0].push(c1index);
                            matchIndexHolder[1].push(c2index);
                            matchIndexHolder[2].push(c3index);
                        }
                        // else, do nothing (look at next client 1 object)
                    });
                }

                // loop through 'matchIndexHolder', removing all elems
                // -> with specified indices (unless no elems in 1st array)
                if (matchIndexHolder[0].length > 0) {
                    // loop through matching index arrays
                    matchIndexHolder.forEach((indexMatchArr, clientIndex) => {
                        // first, sort the array in reverse order (max -> min)
                        // -> so we splice higher indexes out of data_container
                        // -> first, not interrupting / disordering the smaller indices
                        indexMatchArr.sort((a, b) => b - a);
                        
                        // loop through values (field indices) of each array
                        indexMatchArr.forEach(fieldIndex => {
                            // splice (remove) the duplicate field from the
                            // -> correct client's array!
                            data_container[clientIndex].splice(fieldIndex, 1);
                        });
                    });
                }

                // for each client array within the data arrays...
                // -> (client 1 data, client 2 data, etc...)
                data_container.forEach((client_data_array, client_index) => {
                    // quit if data array doesn't exist (this happens often in
                    // -> history arrays
                    if (!client_data_array) return;
                    
                    // loop through all data in client's data array...
                    client_data_array.forEach((client_data, data_index) => {
                        // convert each object's props to array
                        Object.entries(client_data)
                        // for each data prob, get key and value
                        .forEach(([data_key, data_value]) => {
                            // calculate new field key name (including
                            // -> client index)
                            const data_index_key = `${runningTotal + data_index + 1}. ${data_key}`;
                            
                            // create empty array if not present yet
                            if (!output[data_index_key]) {
                                output[data_index_key] = [];
                            }

                            // add data to correct index in output object & arrays
                            output[data_index_key][client_index] = data_value;
                            
                            // also add a 5th col value (data_index) - should
                            // -> not display, just to help selecting data
                            output[data_index_key][3] = runningTotal + data_index + 1;
                        });
                    });
                });
                // get max # of elements associated with each client
                const numDataElems = Math.max(
                    data_container[0] ? data_container[0].length : 0,
                    data_container[1] ? data_container[1].length : 0,
                    data_container[2] ? data_container[2].length : 0
                );

                // increment running total (next data_index_key) by the
                // -> max number of elements in the latest data container
                runningTotal += numDataElems
                return output
            }, {})
        )
        // change objs to correct format arr format
        .map(e => [e[0], ...e[1]])
        // filter -> hide row if all values are "blank"
        .filter(dataField => {
            // make array holding 'blank' values (0 and false are not blank
            // -> since they are valid numbers / boolean values)
            const blankTypes = [undefined, null, ''];

            // filter condition - returns true iff ALL params are
            // -> undefined, null, or blank strings
            const condition_allBlank = (a, b, c) =>
                blankTypes.includes(a) &&
                blankTypes.includes(b) &&
                blankTypes.includes(c);

            // Note: can't filter fields by 'all fields the same'
            // -> like in the basic tables b/c matching / duplicate
            // -> fields can show up in different rows :(
            
            // filter based on applied conditions
            return !condition_allBlank(
                dataField[1], dataField[2], dataField[3]
            );
        });

    }
    // handle unknown type
    else {
        errorHandler(`Type <${type}> unknown?? What is this??`);
        return [];
    }
}