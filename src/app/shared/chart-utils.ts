declare var Plotly: any;

export const buttonDownloadImage = {
    name: 'toImage',
    title: 'Download plot as a png',
    icon: Plotly.Icons.camera,
    click: function(gd) {
        const opts = {
            format: 'png',
            width: 900,
            height: 600
        };
        Plotly.downloadImage(gd, opts);
    }
};

export function getDefaultLayout() {
    return {
        margin: {
            b: 48,
            l: 60,
            r: 36,
            t: 12
        },
        showlegend: true,
        legend: {
            orientation: 'v',
            bgcolor: '#EAFAFF90',
            bordercolor: 'whitesmoke',
            borderwidth: 1
        },
        autosize: true
    };
}

export function configureDefaultLayout(widget) {
    const layout = getDefaultLayout();
    const update = {
        xaxis: {
            title: "Date UTC",
            type: "date"
        },
        yaxis: {
            title: widget['yAxisTitle'],
            type: widget['yAxisScale'] || 'lin'
        },
        legend: getLegendConfig(widget['legend'])
        }
        if (widget['yAxis2Enabled']) {
            update['yaxis2'] = {
                title: widget['yAxis2Title'],
                type: widget['yAxisScale'] || 'lin',
                overlaying: 'y',
                side: 'right'
            }
        }
    return Object.assign(layout, update);
}

export function getLegendConfig(preset) {
    const common = {
        orientation: 'v',
        bgcolor: '#EAFAFFC0',
        bordercolor: 'whitesmoke',
        borderwidth: 1
    }
    let update;
    switch(preset) {
    case 'outside-left': {
        update = {x: -0.05, xanchor: 'right'};
        break;
    }
    case 'left': {
        update = {x: 0, xanchor: 'left'};
        break;
    }
    case 'outside-right': {
        update = {x: 1, xanchor: 'left'};
        break;
    }
    case 'right': {
        update = {x: 1, xanchor: 'right'};
        break;
    }
    case 'horizontal': {
        update = {orientation: 'h'};
        break;
    }
    default: {
        update = {x: 1, xanchor: 'left'};
    }
    }
    return Object.assign(common, update);
}


export function getDefaultConfig() {
    return {
        modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'toImage'],
        modeBarButtonsToAdd: [buttonDownloadImage],
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

export function setAutorange(layout) {
    const xaxis = layout['xaxis'] = (layout['xaxis'] || {});
    const yaxis = layout['yaxis'] = (layout['yaxis'] || {});
    xaxis['autorange'] = true;
    xaxis['range'] = undefined;
    yaxis['autorange'] = true;
    yaxis['range'] = undefined;
    return {xaxis: xaxis, yaxis: yaxis};
}

export function setXRange(layout, min, max) {
    const xaxis = layout['xaxis'] = (layout['xaxis'] || {});
    const newRange = [min, max];
    xaxis['range'] = newRange;
    xaxis['autorange'] = false;
    return {xaxis: xaxis};
}

export function detectWebGLContext() {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    let detected = false;
    if (gl && gl instanceof WebGLRenderingContext) {
        detected = true;
    }
    canvas.remove();
    return detected;
}

export function parseUNIXTimestamp(ts) {
    return new Date(ts*1000);
}

export function parseStringTimestamp(ts) {
    return new Date(ts);
}
