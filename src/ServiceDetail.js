import React from "react";
import {
    Grid,
    Link,
    ListItemIcon,
    ListItemText,
    Switch,
    Tooltip
} from '@material-ui/core';
import {Launch, List} from '@material-ui/icons';


class ServiceDetail extends React.Component {

    isRunning = () => this.props.service.status === "running";

    toggleRunning = () => {
        const command = this.isRunning() ? "stop" : "start";
        fetch(`http://localhost:2000/_/servers/${this.props.serviceName}/${command}`, {method: "POST"});
    };

    maybeRenderServiceLink = () => {
        const {serviceName, showUrl} = this.props;

        if (!showUrl) {
            return (
                <div style={{minWidth: 32}}></div>
            )
        }
        return (
            <ListItemIcon style={{minWidth: 32}}>
                <Link component="button" onClick={(event) => {
                    event.stopPropagation();
                    window.open(`http://localhost:2000/${serviceName}`)
                }}>
                    <Launch fontSize="small" style={{marginBottom: -2}}/>
                </Link>
            </ListItemIcon>
        )
    };

    renderServiceLogsLink = () => {
        const {serviceName} = this.props;

        return (
            <ListItemIcon style={{minWidth: 32}}>
                <Link component="button" onClick={(event) => {
                    event.stopPropagation();
                    window.open(`http://localhost:3000/?service=${serviceName}`)
                }}>
                    <List fontSize="small" style={{marginBottom: -2}}/>
                </Link>
            </ListItemIcon>
        )
    };

    render() {
        const {serviceName} = this.props;

        const detailTooltip = serviceName === "khan-ui" ?
            "khan-ui can't be disabled!" :
            `${this.isRunning() ? "Disable" : "Enable"} ${serviceName}`;

        return (
            <Grid container>
                <Grid item xs={9} style={styles.row}>
                    {this.maybeRenderServiceLink()}
                    <ListItemText primary={serviceName} style={{minWidth: 120}}/>
                </Grid>
                <Grid item xs={3} style={styles.row}>
                    <Tooltip title={detailTooltip}>
                        <div>
                            <Switch
                                checked={this.isRunning()}
                                onChange={this.toggleRunning}
                                disabled={serviceName === "khan-ui"}
                            />
                        </div>
                    </Tooltip>
                    <Tooltip title="View these logs in a new tab">
                        {this.renderServiceLogsLink()}
                    </Tooltip>
                </Grid>
            </Grid>
        );
    }
}

const styles = {
    row: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    }
};
export default ServiceDetail;
