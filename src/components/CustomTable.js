import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

// import core components
import {
    Table, TableBody, TableHead, TableRow,
    Paper
} from '@material-ui/core';

import CustomTableCell from './CustomTableCell';

class CustomTable extends Component {
    state = {
        clientData: [],
        selectedRows: []
    }

    componentWillMount() {
        const { multiSelect, data } = this.props;

        // initialize empty array of correct length and girth for
        // -> selected indices to be placed in.
        const initialSelectionArr = data.map(row =>
            // check if first data elem is populated / not empty
            row[1] && row[1].length > 0
                // first cell has data, so pre-populate
                ? multiSelect
                    ? [true]
                    : 0
                // first cell empty, so initialize empty
                : multiSelect
                    ? []
                    : null
        );

        this.setState({
            clientData: data,
            selectedRows: initialSelectionArr
        });
    }

    componentDidMount() {
        const {
            multiSelect,
            tableKey,
            cellSelectHandler
        } = this.props;
        const { selectedRows } = this.state;

        let allRowsSelected = true;

        selectedRows.forEach((row) => {
            if (multiSelect) {
                if (!row.includes(true)) allRowsSelected = false;
                else {} // don't care... default is true
            }
            else {
                if (![0,1,2].includes(row)) allRowsSelected = false;
                else {} // don't care... default is true
            }
        });

        cellSelectHandler(tableKey, allRowsSelected, selectedRows);
    }

    onCellSelect = (row, col) => (event) => {
        const {
            cellSelectHandler,
            tableKey, multiSelect,
        } = this.props;

        const {
            clientData: data,
            selectedRows
        } = this.state;

        let isAllSelected = true;
        // FIXME: is this deep enough cloning?
        let selected = [...selectedRows];

        // change logic depending on multiSelect
        if (multiSelect) {
            // get selected row's client index
            const selectedClientIndex = data[row][4];
            // loop through data, looking for same client index
            data.forEach((dataRow, dataRowIndex) => {
                const clientIndex = dataRow[4];

                // indices match, set or unset value for client cells
                if (clientIndex === selectedClientIndex) {
                    // if not selected, select!
                    if (!selected[dataRowIndex][col]) {
                        selected[dataRowIndex][col] = true;
                        // check other cells selected in bottom 'else'
                    }
                    else {
                        // else, de-select
                        selected[dataRowIndex][col] = null;
                        // check if ALL are de-selected
                        if (!selected[dataRowIndex].includes(true))
                            isAllSelected = false;
                    }
                }
                // no match, still check if all table is selected
                else {
                    if (!selected[dataRowIndex].includes(true))
                        isAllSelected = false;
                }
            });
        }
        // handle select / delect for single-select table
        else {
            // if not selected, select!
            if (selected[row] !== col) {
                selected[row] = col;
                // check if all other cells are selected too!
                selected.forEach((data, i) => {
                    if (data === null) isAllSelected = false;
                });
            }
            // else, de-select
            else {
                selected[row] = null;
                isAllSelected = false;
            }
        }
        // pass 'allselected' status back to App.js, save 'selected'
        // -> to current state
        cellSelectHandler(tableKey, isAllSelected, selected);
        this.setState({ selectedRows: selected })
    }

    isSelected = (row, col) => {
        const {
            multiSelect,
            classes: { cellIsSelected },
        } = this.props;

        const {
            selectedRows
        } = this.state;

        // multi-select logic
        if (multiSelect) {
            return selectedRows[row][col] === true
                ? cellIsSelected
                : null
        }
        // single-select logic
        else {
            return selectedRows[row] === col
                ? cellIsSelected
                : null
        }
    }

    isRowSelected = (row) => {
        const { selectedRows } = this.state;
        const {
            multiSelect, locked,
            classes: {
                rowIsSelected,
                rowNotSelectedAndLocked,
                rowNotSelected
            },
        } = this.props;

        // multi-select logic
        if (multiSelect) {
            return (
                selectedRows[row][0] === true ||
                selectedRows[row][1] === true ||
                selectedRows[row][2] === true
            ) ? rowIsSelected
            : locked
                ? rowNotSelectedAndLocked
                : rowNotSelected;
        }
        // single-select logic
        else {
            return selectedRows[row] !== null
                ? rowIsSelected
                : locked
                    ? rowNotSelectedAndLocked
                    : rowNotSelected;
        }
    }

    // set up click listener & className(s) for custom table cell with
    // -> populated text!
    getInteractiveTableCellProps = (row, col) => {
        const { classes, locked } = this.props;

        // set up onClick function
        let clickFn = () => console.log('clicked! but locked');
        if (!locked) clickFn = this.onCellSelect(row, col);

        // set up classes
        const cellClasses = [this.isSelected(row, col)];
        if (!locked) cellClasses.push(classes.cellHover);

        return {
            onClick: clickFn,
            className: cellClasses.join(' ')
        }
    }
    
    render() {
        const {
            classes, clientNums,
            errorHandler,
            title,
            numCols,
            // clientData
        } = this.props;

        const {
            clientData: data
        } = this.state;

        // if data is empty, don't display table!
        if (!data || data.length === 0) {
            let msg =
                `[${title}] Table Error: Raw data passed to CustomTable is empty. ` +
                'If this error doesn\'t go away, check implementation of this component for errors.';
            errorHandler(msg, 'warn');

            return null;
        }

        return (
            <Paper className={classes.root}>
                <h3>{title}</h3>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <CustomTableCell>Field Names</CustomTableCell>
                            <CustomTableCell>{`Client #1 (${clientNums[0]})`}</CustomTableCell>
                            <CustomTableCell>{`Client #2 (${clientNums[1]})`}</CustomTableCell>
                            {numCols === 2 ? null : 
                                <CustomTableCell>{`Client #3 (${clientNums[2]})`}</CustomTableCell>
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((n, row) =>
                            <TableRow className={classes.row} key={row}>
                                <CustomTableCell
                                    component="th"
                                    scope="row"
                                    className={this.isRowSelected(row)}
                                >
                                    {n[0]}
                                </CustomTableCell>
                                {[1,2,3].map((i, col) => {
                                    // conditionally render column #4
                                    if (i > numCols) return null;

                                    let props = { key: `${row}-${col}` };
                                    
                                    // make cell interactive if it has data
                                    if (n[i] && n[i].length > 0) {
                                        props = {
                                            ...props,
                                            ...this.getInteractiveTableCellProps(row, col)
                                        }
                                    }

                                    return <CustomTableCell {...props} >
                                        {n[i]}
                                    </CustomTableCell>
                                })}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
};

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
    },
    cellIsSelected: {
        backgroundColor: '#357a38'
    },
    rowIsSelected: {
        backgroundColor: '#6fbf73'
    },
    rowNotSelectedAndLocked: {
        backgroundColor: '#F44336' // red 500
    },
    rowNotSelected: {
        backgroundColor: '#ffcd38'
    },
    cellHover: {
        '&:hover': {
            backgroundColor: '#4caf50'
        }
    }
});

export default withStyles(styles)(CustomTable);