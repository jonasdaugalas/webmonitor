declare var Plotly: any;

export function getDefaultLayout() {
    return {
        margin: {
            b: 40,
            l: 60,
            r: 40,
            t: 30
        },
        showlegend: true,
        legend: {
            orientation: "h"
        },
        autosize: true
    };
};


export function getDefaultConfig() {
    return {
        modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'toImage'],
        displaylogo: false
    }
}

export function makeDefaultReflowFunction(element) {
    return () => {
        setTimeout(() => {
            Plotly.relayout(element, {width: null, height: null});
        });
    }
}
