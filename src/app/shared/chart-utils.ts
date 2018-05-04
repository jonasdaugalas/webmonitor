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
        xaxis: {
            title: "Date UTC",
            ticks: "outside",
            type: "date"
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

export function subscribeReflow(eventBus, reflow) {
    return eventBus.getEvents(0, 'global_reflow').subscribe(reflow);
}
