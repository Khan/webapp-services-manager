import React from "react";

export default function SyntaxHighlighted({logs, language}) {
    const highlightedLogs = window.Prism.highlight(
        logs,
        window.Prism.languages[language],
        language,
    );

    return (
        <pre>
            <code dangerouslySetInnerHTML={{
                __html: highlightedLogs
            }}/>
        </pre>
    );
}
