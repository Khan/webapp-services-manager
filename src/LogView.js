import React from "react";
import {Container, Card} from '@material-ui/core';

import sharedStyles from "./styles.js";
import Ansi from "./log-renderers/Ansi.js";
import Raw from "./log-renderers/Raw.js";
import SyntaxHighlighted from "./log-renderers/SyntaxHighlighted.js";

class LogView extends React.Component {
    scrollable = React.createRef();

    componentDidMount() {
        this.scrollable.current.onscroll = this.handleOnScroll;
    }

    componentDidUpdate({logs, autoScroll}) {
        if ((!autoScroll && this.props.autoScroll) ||
            (this.props.autoScroll && logs !== this.props.logs)) {
            this.maybeAutoScroll();
        }
    }

    componentWillUnmount() {
        this.scrollable.current.removeEventListener("onscroll", this.handleOnScroll);
    }

    handleOnScroll = () => {
        const {autoScroll, onCancelAutoScroll, onEnableAutoScroll} = this.props;
        if (this.autoScrolling){
            return;
        }
        if (autoScroll && onCancelAutoScroll) {
            onCancelAutoScroll();
        }

        if (!autoScroll && onEnableAutoScroll) {
            // If the user scrolls to the bottom, auto-scroll them again.
            const element = this.scrollable.current;
            if (element.scrollTop + element.offsetHeight >= element.scrollHeight) {
                onEnableAutoScroll();
            }
        }
    };

    maybeAutoScroll = () => {
        const {autoScroll} = this.props;

        if (autoScroll && this.scrollable) {
            const element = this.scrollable.current;
            this.autoScrolling = true;
            element.scroll({
                top: element.scrollHeight,
                behavior: 'auto',
            });
            setTimeout(() => this.autoScrolling = false, 1000);
        }
    };

    renderLogs() {
        const {config, darkMode, logs, serviceName} = this.props;

        if (!logs) {
            return <Card>There are no logs for this service at this time.</Card>;
        }

        const colorLang = config.get(serviceName, "COLOR_LANG", "ansi");
        
        if (colorLang === "ansi") {
            return <Ansi logs={logs} darkMode={darkMode} />;
        } else if (colorLang === "raw") {
            return <Raw logs={logs} darkMode={darkMode} />;
        }
        
        return <SyntaxHighlighted logs={logs} language={colorLang} darkMode={darkMode} />;
    }

    render() {
        return (
            <Container style={styles.logContainerWrapper} ref={this.scrollable}>
                <div style={{paddingBottom: 24}}>
                    <Container style={styles.logContainer}>
                    {this.renderLogs()}
                </Container>
                </div>
            </Container>
        );
    }
}

const styles = {
    logContainerWrapper: {
        ...sharedStyles.scrollable,
        maxWidth: "unset"
    },
    logContainer: {
        maxWidth: "unset",
        display: "flex",
        flexDirection: "column",
        padding: 0,
    }
};
export default LogView;
