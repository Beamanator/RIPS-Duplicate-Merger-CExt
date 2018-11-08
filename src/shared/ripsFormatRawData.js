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
 * @param {function} errorHandler - error handler function
 * @param {string} key - data key
 */
export const formatRawData = (rawData, key, type="basic") => {
    // throw error if data is empty
    if (!rawData || Object.keys(rawData).length === 0) {
        let msg = `rawData with key <${key}> is empty!`;
        console.error(msg);
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
                console.error(err, dataCategory);
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
                        console.error('Huh? How is there a "number" dataType?', 'warn');
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
                        console.error(
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

            // first elem is fieldName (ex: 'FIRST_NAME'). If next 3 
            // -> fields are empty, don't display that data
            return !condition_allBlank(
                    dataField[1], dataField[2], dataField[3]
                ) && !condition_allSame(
                    dataField[1], dataField[2], dataField[3]
                );
        });
    }
    // handle arrays of arrays
    else if (type === 'lists') {
        let runningTotal = 0;
        return Object.entries(
            // get array of Obj's props in raw data
            Object.entries(rawData)
            // don't worry about keys, process inner arrays
            .reduce((output, [_, data_container], container_index) => {
                // for each data container array...
                data_container.forEach((client_data_array, client_index) => {
                    // quit if data array doesn't exist (this happens often in
                    // -> history arrays
                    if (!client_data_array) return;
                    // for client's data array...
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
        .filter(data => {
            // make array holding 'blank' values (0 and false are not blank
            // -> since they are valid numbers / boolean values)
            const blankTypes = [undefined, null, ''];
            
            // first elem is fieldName (ex: 'FIRST_NAME'). If next 3 
            // -> fields are empty, don't display that data
            return !(
                blankTypes.includes(data[1]) &&
                blankTypes.includes(data[2]) &&
                blankTypes.includes(data[3])
            );
        });

    }
    // handle unknown type
    else {
        const msg = `Type <${type}> unknown?? What is this??`;
        console.error(msg);
        // errorHandler(msg);
        return [];
    }
}