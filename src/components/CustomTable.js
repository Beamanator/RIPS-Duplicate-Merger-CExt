import React from 'react';
import { withStyles } from '@material-ui/core/styles';

// import core components
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    Paper
} from '@material-ui/core';

// custom table styles
const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white
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


// sample data...
let id = 0;
const createData = (name, calories, fat, carbs, protein) => {
    id += 1;
    return { id, name, calories, fat, carbs, protein };
}

const data = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
];

const CustomTable = (props) => {
    const { classes } = props;

    return (
        <Paper className={classes.root}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <CustomTableCell>dessert (100g serving)</CustomTableCell>
                        <CustomTableCell>Calories</CustomTableCell>
                        <CustomTableCell>fat</CustomTableCell>
                        <CustomTableCell>carbs</CustomTableCell>
                        <CustomTableCell>protein</CustomTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map(n =>
                        <TableRow className={classes.row} key={n.id}>
                            <CustomTableCell component="th" scope="row">
                                {n.name}
                            </CustomTableCell>
                            <CustomTableCell>{n.calories}</CustomTableCell>
                            <CustomTableCell>{n.fat}</CustomTableCell>
                            <CustomTableCell>{n.carbs}</CustomTableCell>
                            <CustomTableCell>{n.protein}</CustomTableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default withStyles(styles)(CustomTable);