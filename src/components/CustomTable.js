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
    }
});

const convertRawData = (rawData) =>
    // get array of entries in raw data
    Object.entries( rawData )
    // add raw data arrays to category
    .map(e => [e[0], ...e[1]])


const CustomTable = (props) => {
    const { classes, data: rawData } = props;
    const data = convertRawData(rawData);

    console.log('props', data)

    return (
        <Paper className={classes.root}>
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