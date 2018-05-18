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
};

export function getLegendConfig(preset) {
    const common = {
        orientation: 'v',
        bgcolor: '#EAFAFF90',
        bordercolor: 'whitesmoke',
        borderwidth: 1
    }
    switch(preset) {
    case 'outside-left': {
        return Object.assign(common, {
            x: -0.05,
            xanchor: 'right'
        });
    }
    case 'left': {
        return Object.assign(common, {
            x: 0,
            xanchor: 'left'
        });
    }
    case 'outside-right': {
        return Object.assign(common, {
            x: 1,
            xanchor: 'left'
        });
    }
    case 'right': {
        return Object.assign(common, {
            x: 1,
            xanchor: 'right'
        });
    }
    default: {
        return Object.assign(common, {
            orientation: 'h'
        });
    }
    }
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
    yaxis['autorange'] = true;
    return layout;
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
