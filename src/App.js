import React from "react";
import {
    createMuiTheme,
    AppBar,
    Grid,
    CssBaseline,
    Typography,
    Toolbar,
    IconButton,
    Tooltip,
    Snackbar,
    Button
} from '@material-ui/core';
import {ThemeProvider, withStyles} from "@material-ui/styles";
import {
    ArrowDownward,
    ClearAll,
    BrightnessHigh,
    Brightness4,
    Close
} from '@material-ui/icons'

import {getSetting, saveSetting} from "./settings.js";
import SideNav from "./SideNav.js"
import LogView from "./LogView.js";
import Configuration from "./configuration.js";
import "./App.css";


const styles = {
    // this group of buttons will be aligned to the right side
    toolbarButtons: {
        marginLeft: 'auto',
    },
    scrollableParent: {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
    },
    autoScrollOn: {
        backgroundColor: "#1F3195",
    },
};

const myWorker = new Worker("worker.js");

class App extends React.Component {
    state = {
        selectedService: getSetting("selected-service"),
        isLogViewOnly: false,
        services: {},
        logs: {},
        darkMode: getSetting("dark-mode"),
        autoScroll: true,
        showNewMessagesAlert: false,
    };


    componentDidMount() {

        const urlParams = new URLSearchParams(window.location.search);
        const selectedService = urlParams.get('service');
        if (selectedService) {
            this.setState({selectedService, isLogViewOnly: true});
        }

        myWorker.postMessage({initialize: {service: selectedService || null}});

        myWorker.onmessage = (e) => {
            const {data} = e;
            if (data.services) {
                this.setState({services: data.services})
            }
            if (data.logs) {
                // If we aren't auto-scrolling and a new message arrived, notify the user
                if (!this.state.autoScroll) {
                    if (this.state.logs[this.state.selectedService] !== data.logs[this.state.selectedService]) {
                        this.setState({showNewMessagesAlert: true});
                    }
                }
                this.setState({logs: data.logs});
            }
        };
    }

    componentWillUnmount() {
        myWorker.postMessage({teardown: true});
    }

    select = selectedService => {
        this.setState({selectedService});
        saveSetting("selected-service", selectedService);
    };

    clearLogs = service => {
        this.setState({
            logs: {
                ...this.state.logs,
                [service]: "",
            }
        })
    };

    closeNewMessageAlert = () => {
        this.setState({showNewMessagesAlert: false});
    };

    toggleDarkMode = () => {
        const {darkMode} = this.state;

        this.setState({darkMode: !darkMode});
        saveSetting("dark-mode", !darkMode);
    };

    toggleAutoScroll = () => {
        const {autoScroll} = this.state;

        const shouldAutoScroll = !autoScroll;
        this.setState({autoScroll: shouldAutoScroll});
        // saveSetting("auto-scroll", shouldAutoScroll);

        if (shouldAutoScroll) {
            this.closeNewMessageAlert();
        }
    };

    theme = () => {
        const {darkMode} = this.state;

        return createMuiTheme({
            palette: {
                type: darkMode ? "dark" : "light",
            }
        })
    };

    renderActions() {
        const {classes} = this.props;
        const {autoScroll, darkMode, selectedService} = this.state;

        const serviceActions = selectedService && <>
            <Tooltip title="Clear Log">
                <IconButton
                    aria-label="clear Log"
                    onClick={() => this.clearLogs(selectedService)}>
                    <ClearAll/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Auto Scroll Log">
                <IconButton
                    className={autoScroll ? classes.autoScrollOn : ""}
                    aria-label="auto scroll Log"
                    onClick={this.toggleAutoScroll}>
                    <ArrowDownward/>
                </IconButton>
            </Tooltip>
        </>;

        return <div className={classes.toolbarButtons}>
            {serviceActions}
            <Tooltip title="Toggle Dark/Light Mode">
                <IconButton
                    aria-label="toggle dark/light mode"
                    onClick={this.toggleDarkMode}
                >
                    {darkMode ? <BrightnessHigh/> : <Brightness4/>}
                </IconButton>
            </Tooltip>
        </div>;
    }

    renderAutoScrollNotification() {
        const {showNewMessagesAlert} = this.state;

        return <Snackbar
            open={showNewMessagesAlert}
            message="New log messages have arrived!"
            autoHideDuration={6000}
            onClose={this.closeNewMessageAlert}
            action={
                <>
                    <Button
                        color="secondary"
                        size="small"
                        onClick={this.toggleAutoScroll}
                    >
                        Take me there!
                    </Button>
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={this.closeNewMessageAlert}
                    >
                        <Close
                            fontSize="small"
                        />
                    </IconButton>
                </>
            }
        />;
    }

    render() {
        const {autoScroll, darkMode, isLogViewOnly, logs, selectedService, services} = this.state;

        const config = new Configuration(services);
        const rightNavCols = isLogViewOnly ? 12 : 9;

        return <ThemeProvider theme={this.theme()}>
            <CssBaseline/>
            <AppBar position="fixed">
                <Toolbar>
                    {/* TODO(dbraley): replace this with a configured value */}
                    <Typography variant="h4">Khan Webapp Services Manager</Typography>
                    {
                        selectedService &&
                        <Typography variant="h5" style={{paddingTop: 6}}>
                            : {selectedService}
                        </Typography>
                    }
                    {this.renderActions()}
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <Grid container spacing={0} style={{position: "fixed"}}>
                {!isLogViewOnly && (
                    <Grid item md={3} lg={2} style={styles.scrollableParent}>
                        <SideNav
                            config={config}
                            services={services}
                            onSelected={this.select}
                            selectedService={selectedService}
                        />
                    </Grid>
                )}
                <Grid item md={rightNavCols - 1} lg={rightNavCols}
                      style={styles.scrollableParent}>
                    <LogView
                        config={config}
                        darkMode={darkMode}
                        serviceName={selectedService}
                        logs={logs[selectedService]}
                        autoScroll={autoScroll}
                        onCancelAutoScroll={this.toggleAutoScroll}
                        onEnableAutoScroll={this.toggleAutoScroll}
                    />
                    <div style={{minHeight: 24}}></div>
                </Grid>
            </Grid>
            {this.renderAutoScrollNotification()}
        </ThemeProvider>;
    }
}

export default withStyles(styles)(App);
