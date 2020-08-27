onmessage = function (e) {
    if (e.data.initialize) {
        initialize(e.data.initialize.service);
    }
    if (e.data.teardown) {
        teardown();
    }
};

const initialize = (serviceName) => {
    this.eventSource = new EventSource("http://localhost:2000/_/events");
    this.eventSource.onmessage = event => {
        postMessage({"services": JSON.parse(event.data)});
    };

    this.logSource = new EventSource("http://localhost:2000/_/events/output");
    this.logSource.onmessage = event => {
        const logMessage = JSON.parse(event.data);

        if (!serviceName || logMessage.id === serviceName) {
            processLogEvent(logMessage);
        }
    };

    setInterval(() => {
        if (logsUpdated) {
            postMessage({logs});
            logsUpdated = false;
        }
    }, 1000);
};

const teardown = () => {
    this.eventSource && this.eventSource.close();
    this.logSource && this.logSource.close();
};

function appendLog(oldString, log) {
    if (log.indexOf('\b') === -1) {
        return oldString + log;
    }

    const output = oldString.split("");

    // If we get backspace characters, delete the character at the top of the stack
    for (let i = 0; i < log.length; i++) {
        if (log[i] === '\b') {
            output.pop();
        } else {
            output.push(log[i]);
        }
    }

    return output.join("");
}

let logs = {};
let logsUpdated = false;

function processLogEvent(logMessage) {
    const newLog = appendLog((logs[logMessage.id] || ""), logMessage.output);

    logs = {
        ...logs,
        [logMessage.id]: newLog,
    };
    logsUpdated = true;
}

