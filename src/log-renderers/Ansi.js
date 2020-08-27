import React from "react";
import {default as AnsiUp} from 'ansi_up';


function luminanace(r, g, b) {
    // here be magic
    // https://stackoverflow.com/questions/9733288/how-to-programmatically-calculate-the-contrast-ratio-between-two-colors
    var a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow( (v + 0.055) / 1.055, 2.4 );
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function compareContrast(rgb1, rgb2) {
    var lum1 = luminanace(rgb1[0], rgb1[1], rgb1[2]);
    var lum2 = luminanace(rgb2[0], rgb2[1], rgb2[2]);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05)
         / (darkest + 0.05);
}

// This flips the color component on its head.  It won't work well for values in the
// middle of the spectrum, so we might need something smarter for backgrrounds that
// are not white or black.
function flip(colorComponent) {
    return 255 - colorComponent;
}

function contrastedColor(color, darkMode) {
    // These are the colors of the background for dark/light modes
    const background = darkMode ?  [58, 58, 58] : [251, 251, 251];
    const contrast = compareContrast(color, background);

    // 4.5 is the WCAG recommendation for text contrast
    if (contrast < 4.5) {
        return [
            flip(color[0]),
            flip(color[1]),
            flip(color[2]),
        ]
    }

    return color
}

function ensureContrast(html, darkMode) {
    // we want to make sure the colors we see look OK in Light Mode.  Find the colors
    return html.replace(/"color:rgb\(([0-9]+),([0-9]+),([0-9]+)\)"/g, (match, r, g, b) => {
        const newColor = contrastedColor([parseInt(r), parseInt(g), parseInt(b)], darkMode);
        return `"color:rgb(${newColor[0]},${newColor[1]},${newColor[2]})"`;
    });

}

export default function Ansi({darkMode, logs}) {
    const ansiUp = new AnsiUp();
    let formattedLogs = ansiUp.ansi_to_html(logs);
    formattedLogs = ensureContrast(formattedLogs, darkMode);

    return (
        <pre>
            <code dangerouslySetInnerHTML={{
                __html: formattedLogs,
            }}/>
        </pre>
    );
}
