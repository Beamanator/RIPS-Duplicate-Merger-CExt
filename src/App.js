import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import CustomTable from './components/CustomTable';

// import core components
import {
    Button,
    Grid,
    Paper,
    TextField
} from '@material-ui/core';

// set up styles
const styles = theme => ({
    root: {
        flexGrow: 1
    },
    textCenter: {
        textAlign: 'center'
    },
    button: {
        margin: theme.spacing.unit
    },
    // header styles
    header: {
        padding: '1px 0px' // gives it some volume somehow
    },
    // input element styles
    clientNumContainer: {
        padding: '10px 0 20px 0'
    },
    // text-area styles
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
});

class App extends Component {
    state = {
        client1: '',
        client2: '',
        client3: ''
    }

    handleInputChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    }

    handleImport = () => {
        console.log('clicked Import');
    }

    handleClear = () => {
        console.log('clicked Clear');
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid
                container 
                className={classes.root}
                spacing={16}
            >
                {/* Title */}
                <Grid item xs={12} className={classes.textCenter}>
                    <Paper className={classes.header}>
                        <h1>Welcome to "The Merger"!</h1>
                    </Paper>
                </Grid>

                {/* Input elements - StARS #s*/}
                <Grid item xs={12} className={classes.textCenter}>
                    <Paper className={classes.clientNumContainer}>
                        <h3>Enter StARS #s for each client below:</h3>
                        <Grid container justify="center" spacing={40}>
                            <Grid item xs={3}>
                                <TextField
                                    id="client1"
                                    label="Client #1"
                                    className={classes.textField}
                                    value={this.state.client1}
                                    onChange={this.handleInputChange('client1')}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id="client2"
                                    label="Client #2"
                                    className={classes.textField}
                                    value={this.state.client2}
                                    onChange={this.handleInputChange('client2')}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id="client3"
                                    label="Client #3"
                                    className={classes.textField}
                                    value={this.state.client3}
                                    onChange={this.handleInputChange('client3')}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* "import" / "clear" buttons - begin collecting data or clear! */}
                <Grid item xs={12} className={classes.textCenter}>
                    <Grid container justify="center">
                        <Grid item xs={2}>
                            <Button
                                color="primary"
                                className={classes.button}
                                variant="contained"
                                size="large"
                                onClick={this.handleImport}
                            >
                                Import
                            </Button>
                        </Grid>
                        <Grid item xs={2}>
                            <Button
                                color="secondary"
                                className={classes.button}
                                variant="contained"
                                size="large"
                                onClick={this.handleClear}
                            >
                                Clear
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* TODO: <Client Basic Information> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    <Paper className={classes.header}>
                        <h3>Client Basic Information</h3>
                        {/* TODO: pass data down */}
                        <CustomTable />
                    </Paper>
                </Grid>

                {/* TODO: <Addresses> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Addresses
                </Grid>
                
                {/* TODO: <Notes> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Notes
                </Grid>
                
                {/* TODO: <Aliases> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Aliases
                </Grid>

                {/* TODO: <Relatives> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Relatives
                </Grid>

                {/* TODO: <Contacts> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Contacts
                </Grid>

                {/* TODO: <Files (normal and private)> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Files (normal and pivate)
                </Grid>

                {/* TODO: <Actions / services> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Actions / Services
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(App);
