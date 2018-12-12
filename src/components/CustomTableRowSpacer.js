import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import {
    TableRow, TableCell
} from '@material-ui/core';

const CustomTableRowSpacer = (props) => {
    const { classes } = props;
    return (
        <TableRow classes={{ root: classes.root }}>
            <TableCell
                classes={{
                    root: classes.cellStyle,
                }}
            >-</TableCell>
        </TableRow>
    );
}


const styles = theme => ({
    root: {
        height: 0, // override height
    },
    cellStyle: {
        color: 'rgb(224,224,224)',
        backgroundColor: 'rgb(224,224,224)',
        height: '1px',
        fontSize: '0px', // override
        padding: '0px', // override
    }
});

export default withStyles(styles)(CustomTableRowSpacer);
