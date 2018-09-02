import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

// import core components
import {
    Table, TableBody, TableHead, TableRow,
    Paper
} from '@material-ui/core';

import CustomTableCell from './CustomTableCell';

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

class CustomTable extends Component {
    state = {
        selected: null,
        data: []
    };

    componentWillMount = () => {
        // format raw data as we like
        const data = this.convertRawData();

        // initialize empty array of correct length and girth
        const emptySelectionArr = data.map(e =>
            this.props.multiSelect ? [] : null);

        // update state
        this.setState({
            data: data,
            selected: emptySelectionArr
        })
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
                // make array holding 'blank' values (0 and false are not blank!)
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
            // TODO: comment this out to make it more clear!! plzzz
            return Object.entries(Object.entries(rawData)
                .reduce((output, [_, data_container]) => {
                    // if (data_container.length === 0) return {};
                    data_container.forEach((client_data_array, client_index) => {
                        if (client_data_array) {
                            client_data_array.forEach((client_data, data_type_index) => {
                                // console.log(client_data, index);
                                Object.entries(client_data).forEach(([data_key, data_value]) => {
                                    const data_key_index = `${data_type_index + 1}. ${data_key} `;
                                    if (!output[data_key_index]) output[data_key_index] = [];
                                    output[data_key_index][client_index] = data_value;
                                })
                            })
                        }
                    });
                    return output
                }, {})
            )
            // change objs to correct format arr format
            .map(e => [e[0], ...e[1]])
            // filter -> hide row if all values are "blank"
            .filter(data => {
                // make array holding 'blank' values (0 and false are not blank!)
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
        let selected = [...this.state.selected];

        // change logic depending on multiSelect
        if (this.props.multiSelect) {
            // if not selected, select!
            if (!selected[row][col]) {
                selected[row][col] = true;
            }
            // else, de-select
            else {
                selected[row][col] = null;
            }
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

        this.setState({ selected: selected })
    }

    isSelected = (row, col) => {
        const { selected } = this.state;
        const { multiSelect, classes } = this.props;
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
        const { selected } = this.state;
        const {
            multiSelect,
            classes: {
                rowIsSelected, rowNotSelected
            }
        } = this.props;

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
    
    render() {
        const {
            classes,
            errorHandler,
            // multiSelect
            title,
        } = this.props;

        const {
            data,
            selected
        } = this.state;


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
                        {data.map((n, i) =>
                            <TableRow className={classes.row} key={i}>
                                <CustomTableCell
                                    component="th"
                                    scope="row"
                                    className={this.isRowSelected(i)}
                                >
                                    {n[0]}
                                </CustomTableCell>
                                <CustomTableCell
                                    onClick={this.onCellSelect(i, 0)}
                                    className={[
                                        this.isSelected(i, 0),
                                        classes.cellHover
                                    ].join(' ')}
                                >{n[1]}</CustomTableCell>
                                <CustomTableCell
                                    onClick={this.onCellSelect(i, 1)}
                                    className={[
                                        this.isSelected(i, 1),
                                        classes.cellHover
                                    ].join(' ')}
                                >{n[2]}</CustomTableCell>
                                <CustomTableCell
                                    onClick={this.onCellSelect(i, 2)}
                                    className={[
                                        this.isSelected(i, 2),
                                        classes.cellHover
                                    ].join(' ')}
                                >{n[3]}</CustomTableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
};

export default withStyles(styles)(CustomTable);