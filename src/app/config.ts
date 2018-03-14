export { environment } from 'app/../environments/environment';

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
