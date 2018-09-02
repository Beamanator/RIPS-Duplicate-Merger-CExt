import React from 'react';

import {
    withStyles,
    TableCell
} from '@material-ui/core';

// custom table Component
const CustomTableCell = (props) => {
    // console.log(props)
    // const { selected } = props;

    // // TODO: what do we do here??
    // if (selected) {
    //     return <TableCell {...props} />
    // }

    return (
        <TableCell {...props} />
    )
}

const styles = theme => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        fontSize: 16
    },
    body: {
        fontSize: 14
    }
});

export default withStyles(styles)(CustomTableCell);