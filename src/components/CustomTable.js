import React from 'react';
import { withStyles } from '@material-ui/core/styles';

// import core components
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    Paper
} from '@material-ui/core';

// custom table Component
const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        fontSize: 16
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

// regular component styles
const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        minWidth: 700,
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default
        }
    },
    error: {
        color: 'red',
        fontSize: 20,
        fontWeight: 'bold'
    }
});

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
 * @param {string} title - table title
 */
const convertRawData = (rawData, errorHandler, title) => {
    // throw error if data is empty
    if (!rawData || Object.keys(rawData).length === 0) {
        let msg = `Data passed to ${title} table is empty!`;
        errorHandler(msg);
        return;
    }

    // get array of entries in raw data
    return Object.entries( rawData )
    // add raw data arrays to category
    .map(dataCategory => {
        const key = dataCategory[0];
        let data = dataCategory[1];

        const { pass: dataTypesMatch, dataType } =
        // convert data elements into their native "types"
        data.map(e => typeof(e))
        // remove undefined elements (typeof(undefined) is "undefined")
        .filter(type => type !== 'undefined')
        // pass if defined data's types are all the same!
        .reduce((container, dataType) => {
            // if type hasn't been set, pass the dataType
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
            let err = key + ' has mismatched data types' +
                ' in data array! why?? fix this!';
            console.error(err, dataCategory);
            // add errors to output
            return [key, ...data.map(e => 'ERROR')]
        }
        // else, all dataTypes are the same! onward!
        else {
            // depending on the type, return different data
            switch(dataType) {
                case 'string': // do nothing, just display data!
                    break;
                case 'number': // do nothing, except add "confused" warning
                    console.warn('Huh? How is there a "number" dataType?');
                    break;
                case 'object':
                    // TODO: throw warning if it's an object, not array :D
                    break;
                case 'boolean':
                    data = data.map(e => e ? 'checked' : 'not checked');
                    break;
                case 'undefined': // all undefined - these will get
                    // -> filtered out later - don't worry now
                    break;
                default:
                    console.error('How did we get here?? Data doesnt match' +
                    ' any expected values somehow...', key, dataType);
            }
            return [key, ...data]
        }
    })
    // TODO: filter -> hide if all values are empty (e[1], e[2], e[3])
    // TODO: if elements (index 1, 2, or 3) are arrays, go deeper
}

const CustomTable = (props) => {
    const {
        classes,
        rawData,
        errorHandler,
        title
    } = props;
    const data = convertRawData(rawData, errorHandler, title);

    // if data is empty, don't display table!
    if (!data || data.length === 0) {
        let msg =
            `[${title}] Table Error: Raw data passed to CustomTable is empty. ` +
            'Check implementation of this component for errors.';
        errorHandler(msg);

        return (
            <div className={classes.error}>
                {`Error in '${title}' data`}
            </div>
        );
    }

    return (
        <Paper className={classes.root}>
            <h3>{title}</h3>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <CustomTableCell>Field Names</CustomTableCell>
                        <CustomTableCell>Client #1</CustomTableCell>
                        <CustomTableCell>Client #2</CustomTableCell>
                        <CustomTableCell>Client #3</CustomTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((n, index) =>
                        <TableRow className={classes.row} key={index}>
                            <CustomTableCell component="th" scope="row">
                                {n[0]}
                            </CustomTableCell>
                            <CustomTableCell>{n[1]}</CustomTableCell>
                            <CustomTableCell>{n[2]}</CustomTableCell>
                            <CustomTableCell>{n[3]}</CustomTableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default withStyles(styles)(CustomTable);