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
    .map(e => [e[0], ...e[1]])
    // TODO: if elements (index 1, 2, or 3) are arrays, go further
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