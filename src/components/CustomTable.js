import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

// import core components
import {
    Table, TableBody, TableHead, TableRow,
    Paper
} from '@material-ui/core';

// redux store actions
import * as actions from '../store/actions';

import CustomTableCell from './CustomTableCell';

class CustomTable extends Component {
    // state = {
    //     selected: null,
    //     data: []
    // };

    componentWillMount = () => {
        const { title } = this.props;

        // format raw data as we like
        const data = this.convertRawData();

        // initialize empty array of correct length and girth for
        // -> selected indices to be placed in
        const emptySelectionArr = data.map(e =>
            this.props.multiSelect ? [] : null);

        this.props.onTableAddClientData(title, data);
        this.props.onTableAddSelected(title, emptySelectionArr);
        // update state
        // this.setState({
        //     data: data,
        //     selected: emptySelectionArr
        // });
    }

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
    convertRawData = () => {
        const {
            rawData, errorHandler, title, type
        } = this.props;

        // throw error if data is empty
        if (!rawData || Object.keys(rawData).length === 0) {
            let msg = `Data passed to ${title} table is empty!`;
            errorHandler(msg);
            return;
        }

        if (type === "basic") {
            // get array of Obj's props in raw data
            return Object.entries( rawData )
            // add raw data arrays to category / field name / key
            .map(dataCategory => {
                const key = dataCategory[0];
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
                                key, dataType
                            );
                    }
                    // finally, return the new array format
                    return [key, ...data]
                }
            })
            // filter -> hide row if all values are "blank"
            .filter(data => {
                // make array holding 'blank' values (0 and false are not blank
                // -> since they are valid numbers / boolean values)
                const blankTypes = [undefined, null, ''];
                
                // first elem is key (ex: 'FIRST_NAME'). Next 3 keys 
                return !(
                    blankTypes.includes(data[1]) &&
                    blankTypes.includes(data[2]) &&
                    blankTypes.includes(data[3])
                );
            });
        }
        // handle arrays of arrays
        else if (type === 'lists') {
            return Object.entries(
                // get array of Obj's props in raw data
                Object.entries(rawData)
                // don't worry about keys, process inner arrays
                .reduce((output, [_, data_container]) => {
                    // if (data_container.length === 0) return {};
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
                                // -> client index
                                const data_index_key = `${data_index + 1}. ${data_key}`;
                                
                                // create empty array if not present yet
                                if (!output[data_index_key]) {
                                    output[data_index_key] = [];
                                }

                                // add data to correct index in output object & arrays
                                output[data_index_key][client_index] = data_value;
                                
                                // also add a 5th col value (data_index) - should
                                // -> not display, just to help selecting data
                                output[data_index_key][3] = data_index;
                            });
                        });
                    });
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
                
                // first elem is key (ex: 'FIRST_NAME'). Next 3 keys 
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
            errorHandler(msg);
            return [];
        }
    }

    onCellSelect = (row, col) => (event) => {
        const {
            selectedRows,
            clientData,
            title: key
        } = this.props;

        const data = clientData[key];

        // FIXME: is this deep enough cloning?
        let selected = [...selectedRows[key]];

        // change logic depending on multiSelect
        if (this.props.multiSelect) {
            // Select all rows of
            // -> the specified column at the same time
            // 1) get selected row's client index
            const selectedClientIndex = data[row][4];
            // 1) loop through data, looking for same client index
            data.forEach((dataRow, dataRowIndex) => {
                const clientIndex = dataRow[4];

                // only worry about rows that match selected
                // -> client index
                if (clientIndex === selectedClientIndex) {
                    // if not selected, select!
                    if (!selected[dataRowIndex][col]) {
                        selected[dataRowIndex][col] = true;
                    }
                    else {
                        // else, de-select
                        selected[dataRowIndex][col] = null;
                    }
                }
            });
        }
        // handle select / delect for single-select table
        else {
            // if not selected, select!
            if (selected[row] !== col) {
                selected[row] = col;
            }
            // else, de-select
            else {
                selected[row] = null;
            }
        }

        this.props.onTableAddSelected(key, selected);
        // this.setState({ selected: selected })
    }

    isSelected = (row, col) => {
        // const { selected } = this.props;
        const {
            multiSelect, classes,
            selectedRows,
            title: key
        } = this.props;

        const selected = selectedRows[key];

        // multi-select logic
        if (multiSelect) {
            return selected[row][col] === true ?
                classes.cellIsSelected : null
        }
        // single-select logic
        else {
            return selected[row] === col ?
                classes.cellIsSelected : null
        }
    }

    isRowSelected = (row) => {
        // const { selected } = this.state;
        const {
            multiSelect,
            classes: {
                rowIsSelected, rowNotSelected
            },
            selectedRows,
            title: key
        } = this.props;

        const selected = selectedRows[key];

        // multi-select logic
        if (multiSelect) {
            return (
                selected[row][0] === true ||
                selected[row][1] === true ||
                selected[row][2] === true
            ) ? rowIsSelected : rowNotSelected;
        }
        // single-select logic
        else {
            return selected[row] !== null ?
                rowIsSelected : rowNotSelected;
        }
    }

    // set up click listener & className(s) for custom table cell with
    // -> populated text!
    getInteractiveTableCellProps = (row, col) => ({
        onClick: this.onCellSelect(row, col),
        className: [
            this.isSelected(row, col),
            this.props.classes.cellHover
        ].join(' ')
    })
    
    render() {
        const {
            classes,
            errorHandler,
            title,
            numCols,
            clientData
        } = this.props;

        const data = clientData[title];

        // if data is empty, don't display table!
        if (!data || data.length === 0) {
            let msg =
                `[${title}] Table Error: Raw data passed to CustomTable is empty. ` +
                'If this error doesn\'t go away, check implementation of this component for errors.';
            errorHandler(msg);

            return null;
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
                            {numCols === 2 ? null : 
                                <CustomTableCell>Client #3</CustomTableCell>
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
                                    if (i > numCols) return null;

                                    let props = { key: `${row}-${col}` };
                                    
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
    rowNotSelected: {
        backgroundColor: '#ffcd38'
    },
    cellHover: {
        '&:hover': {
            backgroundColor: '#4caf50'
        }
    }
});

const mapStateToProps = state => {
    return {
        clientData: state.tables.clientData,
        selectedRows: state.tables.selected
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onTableAddClientData: (key, data) => dispatch(actions.tableAddClientData(key, data)),
        onTableAddSelected: (key, data) => dispatch(actions.tableAddSelected(key, data))
    };
};

export default connect(
    mapStateToProps, mapDispatchToProps
)(withStyles(styles)(CustomTable));