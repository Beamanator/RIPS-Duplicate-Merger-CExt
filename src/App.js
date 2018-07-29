import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

// import components
import { Grid, Button, Paper } from '@material-ui/core';

// set up styles
const styles = theme => ({
    root: {
        flexGrow: 1
    },
    textCenter: {
        textAlign: 'center'
    },
    // header styles
    header: {
        padding: '1px 0px' // gives it some volume somehow
    }
});

class App extends Component {
    state = {}

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
                <Grid item xs={12}>
                    <p>StARS number input boxes will go here</p>
                </Grid>

                {/* "Go" button - begin collecting data! */}
                <Grid item xs={12}>
                    <Button>
                        Go!
                    </Button>
                </Grid>

                {/* <Client Basic Information> Table */}
                <Grid item xs={12}>
                    Client Basic Information
                </Grid>

                {/* <Addresses> Table */}
                <Grid item xs={12}>
                    Addresses
                </Grid>
                
                {/* <Notes> Table */}
                <Grid item xs={12}>
                    Notes
                </Grid>
                
                {/* <Aliases> Table */}
                <Grid item xs={12}>
                    Aliases
                </Grid>

                {/* <Relatives> Table */}
                <Grid item xs={12}>
                    Relatives
                </Grid>

                {/* <Contacts> Table */}
                <Grid item xs={12}>
                    Contacts
                </Grid>

                {/* <Files (normal and private)> Table */}
                <Grid item xs={12}>
                    Files (normal and pivate)
                </Grid>

                {/* <Actions / services> Table */}
                <Grid item xs={12}>
                    Actions / Services
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(App);
