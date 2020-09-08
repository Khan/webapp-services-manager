import React from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    List,
    ListItem,
    Paper,
} from "@material-ui/core";

import {getSetting, saveSetting} from "./settings.js";
import sharedStyles from "./styles.js";
import ServiceDetail from "./ServiceDetail.js";

function groupServices(config, services) {
    return Object.keys(services).reduce((acc, service) => {
        const group = config.get(service, "GROUP", "Other");
        const running = services[service].status === "running";
        const currentGroup = acc[group] || {runningCount: 0, services: []};
        return {
            ...acc,
            [group]: {
                runningCount: currentGroup.runningCount + running,
                services: [...currentGroup.services, service],
            },
        };
    }, {});
}

class SideNav extends React.Component {
    state = {
        expandedGroups: getSetting("expanded-groups") || [],
    };

    toggleExpanded(group) {
        const {expandedGroups} = this.state;
        let updatedGroups = [];

        if (expandedGroups.includes(group)) {
            updatedGroups = expandedGroups.filter(
                expandedGroup => expandedGroup !== group,
            );
        } else {
            updatedGroups = [...expandedGroups, group];
        }

        this.setState({expandedGroups: updatedGroups});
        saveSetting("expanded-groups", updatedGroups);
    }

    renderListItem(serviceName, service) {
        const {config, selectedService, onSelected} = this.props;

        if (!service) {
            return null;
        }

        return (
            <ListItem
                disableGutters
                style={{paddingRight: 32}}
                key={serviceName}
                button
                selected={selectedService === serviceName}
                onClick={event => {
                    event.stopPropagation();
                    onSelected(serviceName);
                }}
            >
                <ServiceDetail
                    showUrl={config.get(serviceName, "SHOW_URL", false)}
                    serviceName={serviceName}
                    service={service}
                />
            </ListItem>
        );
    }

    render() {
        const {config, services} = this.props;
        const {expandedGroups} = this.state;

        const groupedServices = groupServices(config, services);

        return (
            <Paper style={sharedStyles.scrollable}>
                {Object.keys(groupedServices)
                    .sort()
                    .map(group => (
                        <Accordion
                            expanded={expandedGroups.includes(group)}
                            key={group}
                            onClick={() => this.toggleExpanded(group)}
                        >
                            <AccordionSummary
                                style={{fontSize: 16, fontWeight: "bold"}}
                            >
                                {group} ({groupedServices[group].runningCount} /{" "}
                                {groupedServices[group].services.length})
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                    {groupedServices[group].services
                                        .sort()
                                        .map(serviceName =>
                                            this.renderListItem(
                                                serviceName,
                                                services[serviceName],
                                            ),
                                        )}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    ))}
            </Paper>
        );
    }
}

export default SideNav;
