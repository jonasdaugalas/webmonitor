export { environment } from 'app/../environments/environment';

export const DATA_SOURCES = {
    daq_ES2: {
        endpoint: 'http://srv-s2d16-22-01:9200'
    },
    es_analysis: {
        endpoint: 'http://srv-s2d16-25-01:9200'
    },
    daq_ES6: {
        endpoint: 'http://cmsos-iaas-bril:9200'
    }
}

export const initialSandboxPreset = {
    widgets: [{
        type: 'static-label',
        config: {
            container: {
                width: 100
            },
            widget: {
                pretext: undefined,
                maintext: 'SANDBOX',
                posttext: 'Sandbox is for importing custom dashboard presets. Go to "Settings" -> "Preset import"'
            }
        }
    }]
};
