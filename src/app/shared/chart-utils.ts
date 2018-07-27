declare var Plotly: any;

export type FieldSeparatorConfig = {
    fieldname: string;
    lineColor: string;
    lineWidth: number;
    lineDash?: string;
    text: string;
    excludeWhenAggregated?: boolean;
}

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

export function makeQueryRangeFromZoomEvent(event) {
    if (!event['xaxis.range[0]'] || !event['xaxis.range[1]']) {
        return undefined;
    }
    const min = event['xaxis.range[0]'] + 'Z';
    const max = event['xaxis.range[1]'] + 'Z';
    return {
        'from': new Date(min),
        'to': new Date(max),
        'tsFrom': (new Date(min)).getTime(),
        'tsTo': (new Date(max)).getTime(),
        'strFrom': (new Date(min)).toISOString().split('.')[0] + 'Z',
        'strTo': (new Date(max)).toISOString().split('.')[0] + 'Z',
        'utc': true
    };
}

export function makeQueryRangeFromStrings(min, max) {
    return {
        'from': new Date(min),
        'to': new Date(max),
        'tsFrom': (new Date(min)).getTime(),
        'tsTo': (new Date(max)).getTime(),
        'strFrom': min,
        'strTo': max,
        'utc': true
    };
}

function getFieldChanges(chartData, fields: Array<FieldSeparatorConfig>) {
    const changes = [];
    chartData.forEach(series => {
        if (!series['_extra']) {
            return;
        }
        const perSeries = {};
        fields.forEach(field => {
            if (!series['_extra'][field.fieldname]) {
                return;
            }
            const values = series['_extra'][field.fieldname];
            const perField = [];
            values.forEach((v, i) => {
                if (i === 0) {
                    return;
                }
                if (values[i-1] !== v && typeof v != 'undefined') {
                    perField.push({
                        changedFrom: values[i-1],
                        changedTo: v,
                        index: i,
                        x: series.x[i],
                        x_ts: (new Date(series.x[i])).getTime()
                    });
                }
            });
            perSeries[field.fieldname] = perField;
        });
        changes.push(perSeries);
    });
    return changes;
}

function filterGlobalFieldChanges(changes, fields: Array<FieldSeparatorConfig>) {
    function tsSort(a, b) {
        if (a.x_ts < b.x_ts) {
            return -1;
        }
        if (a.x_ts > b.x_ts) {
            return 1;
        }
        return 0;
    };
    const globalChanges = {};
    fields.forEach(field => {
        let fromAllSeries = [];
        changes.forEach(perSeries => {
            if (!perSeries[field.fieldname]) {
                return;
            }
            fromAllSeries = fromAllSeries.concat(perSeries[field.fieldname]);
        });
        fromAllSeries.sort(tsSort);
        const filtered = [];
        fromAllSeries.forEach(v => {
            if (!filtered.length) {
                filtered.push(v);
                return;
            }
            if (v['changedTo'] !== filtered[filtered.length -1]['changedTo']) {
                filtered.push(v);
            }
        });
        globalChanges[field.fieldname] = filtered;
    });
    return globalChanges;
}

export function makeSeparatorLines(
    chartData, fields: Array<FieldSeparatorConfig>, aggregated=false) {
    if (aggregated) {
        fields = fields.filter(f => !f.excludeWhenAggregated);
    }
    const changes = getFieldChanges(chartData, fields);
    const globalChanges = filterGlobalFieldChanges(changes, fields);
    const shapes = [];
    const annotations = [];
    fields.forEach(field => {
        globalChanges[field.fieldname].forEach(change => {
            shapes.push({
                type: 'line',
                xref: 'x',
                yref: 'paper',
                x0: change['x'],
                x1: change['x'],
                y0: 0,
                y1: 1,
                line: {
                    color: field.lineColor,
                    width: field.lineWidth,
                    dash: field.lineDash
                }
            });
            annotations.push({
                xref: 'x',
                yref: 'paper',
                x: change['x'],
                xanchor: 'left',
                y: 1,
                yanchor: 'top',
                text: field.text + change['changedTo'],
                textangle: -90,
                showarrow: false
            });
        });
    });
    return {shapes: shapes, annotations: annotations};
}
