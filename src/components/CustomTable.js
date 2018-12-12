import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';

// import core components
import {
    Table, TableBody, TableHead, TableRow,
    Paper
} from '@material-ui/core';

import CustomTableRowSpacer from './CustomTableRowSpacer';
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

    onCellSelect = (rowi, coli) => (event) => {
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
            const selectedClientIndex = data[rowi][4];
            // loop through data, looking for same client index
            data.forEach((dataRow, dataRowIndex) => {
                const clientIndex = dataRow[4];

                // indices match, set or unset value for client cells
                if (clientIndex === selectedClientIndex) {
                    // if not selected, select!
                    if (!selected[dataRowIndex][coli]) {
                        selected[dataRowIndex][coli] = true;
                        // check other cells selected in bottom 'else'
                    }
                    else {
                        // else, de-select
                        selected[dataRowIndex][coli] = null;
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
            if (selected[rowi] !== coli) {
                selected[rowi] = coli;
                // check if all other cells are selected too!
                selected.forEach((data, i) => {
                    if (data === null) isAllSelected = false;
                });
            }
            // else, de-select
            else {
                selected[rowi] = null;
                isAllSelected = false;
            }
        }
        // pass 'allselected' status back to App.js, save 'selected'
        // -> to current state
        cellSelectHandler(tableKey, isAllSelected, selected);
        this.setState({ selectedRows: selected })
    }

    isSelected = (rowi, coli) => {
        const {
            multiSelect,
            classes: { cellIsSelected },
        } = this.props;

        const {
            selectedRows
        } = this.state;

        // multi-select logic
        if (multiSelect) {
            return selectedRows[rowi][coli] === true
                ? cellIsSelected
                : null
        }
        // single-select logic
        else {
            return selectedRows[rowi] === coli
                ? cellIsSelected
                : null
        }
    }

    isRowSelected = (rowi) => {
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
                selectedRows[rowi][0] === true ||
                selectedRows[rowi][1] === true ||
                selectedRows[rowi][2] === true
            ) ? rowIsSelected
            : locked
                ? rowNotSelectedAndLocked
                : rowNotSelected;
        }
        // single-select logic
        else {
            return selectedRows[rowi] !== null
                ? rowIsSelected
                : locked
                    ? rowNotSelectedAndLocked
                    : rowNotSelected;
        }
    }

    // set up click listener & className(s) for custom table cell with
    // -> populated text!
    getInteractiveTableCellProps = (rowi, coli) => {
        const { classes, locked } = this.props;

        // set up onClick function
        let clickFn = () => console.log('clicked! but locked');
        if (!locked) clickFn = this.onCellSelect(rowi, coli);

        // set up classes
        const cellClasses = [this.isSelected(rowi, coli)];
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

        this.dataRowGroupHolder = 0;

        // if data is empty, don't display table!
        if (!data || data.length === 0) {
            let msg =
                `[${title}] Table Warning: Raw data passed to CustomTable is empty. ` +
                'This can happen if no unique values were found, or if an error occurred. ' +
                'Check if data is all the same, then check implementation of this component for errors.';
            errorHandler(msg, 'warn');

            return (
                <Paper style={{
                    paddingBottom: '1px',
                    paddingTop: '1px',
                }}>
                    <h3>{title}</h3>
                    <h4>{"No data found OR all data matches between clients"}</h4>
                </Paper>
            );
        }

        return (
            <Paper className={classes.root}>
                <h3>{title}</h3>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow className={classes.tableRow}>
                            <CustomTableCell>Field Names</CustomTableCell>
                            <CustomTableCell>{`Client #1 (${clientNums[0]})`}</CustomTableCell>
                            <CustomTableCell>{`Client #2 (${clientNums[1]})`}</CustomTableCell>
                            {numCols === 2 ? null : 
                                <CustomTableCell>{`Client #3 (${clientNums[2]})`}</CustomTableCell>
                            }
                        </TableRow>
                        <CustomTableRowSpacer />
                    </TableHead>
                    <TableBody>
                        {data.map((rowData, rowi) => {
                            // position 4 is where list group # is stored in rowData arr
                            // -> Note: groupNum is not group index (it starts at 1, not 0)
                            let groupNum = rowData[4];
                            let spacerRow = null;

                            // if data has groupNum (type 'list'), see if we need to add
                            // -> extra spacer row(s) to make the table look nicer
                            if (groupNum) {
                                // if same group as before, don't add spacer
                                if (groupNum === this.dataRowGroupHolder) {}
                                // if groupNum is 1, don't add spacing before
                                // -> spacer is automatically added after header row for
                                // -> EVERY table, not just 'list' tables
                                else if (groupNum === 1) {}
                                // else, new groupnum starting - add spacer before
                                else {
                                    // add row spacer here
                                    spacerRow = <CustomTableRowSpacer />;

                                    // update row group holder number so future rows
                                    // -> can match & not display a spacerRow
                                    this.dataRowGroupHolder = groupNum;
                                }
                            }

                            return (<Fragment key={rowi}>
                                {spacerRow}
                                <TableRow
                                    className={[classes.bodyRow, classes.tableRow].join(' ')}
                                >
                                    <CustomTableCell
                                        component="th"
                                        scope="row"
                                        className={this.isRowSelected(rowi)}
                                    >
                                        {rowData[0]}
                                    </CustomTableCell>
                                    {[1,2,3].map((colNum, coli) => {
                                        // conditionally render column #4
                                        if (colNum > numCols) return null;

                                        let cellProps = { key: `${rowi}-${coli}` };
                                        
                                        // make cell interactive if it has data (check if
                                        // -> data exists using .length b/c all data
                                        // -> come as strings, even checkboxes are 
                                        // -> 'checked' or 'not checked', so .length works)
                                        if (rowData[colNum] && rowData[colNum].length > 0) {
                                            cellProps = {
                                                ...cellProps,
                                                ...this.getInteractiveTableCellProps(rowi, coli)
                                            }
                                        }

                                        return <CustomTableCell {...cellProps}>
                                            {rowData[colNum]}
                                        </CustomTableCell>
                                    })}
                                </TableRow>
                            </Fragment>);
                        })}
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
    bodyRow: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default
        }
    },
    tableRow: {
        display: 'flex', // make sure each cell gets specific horizontal spacing
        height: 'auto', // make sure each cell in row spans full height
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