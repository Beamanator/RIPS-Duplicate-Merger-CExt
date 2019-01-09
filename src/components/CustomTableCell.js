import React from 'react';

import {
    withStyles,
    TableCell
} from '@material-ui/core';

// custom table Component
const CustomTableCell = (props) => {
    return (
        <TableCell {...props} />
    )
}

const styles = theme => ({
    root: {
        flex: '1',
        paddingTop: '15px',
        paddingBottom: '15px',
        wordBreak: 'break-word',
    },
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        fontSize: 16
    },
    body: {
        fontSize: 14
    },
});

export default withStyles(styles)(CustomTableCell);