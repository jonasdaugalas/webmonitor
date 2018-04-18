export const SANDBOX_PATH = '/--sandbox';

export class PresetRoute {
    title?: string;
    path: string;
    config_url: string;
}

export const ROUTES: Array<PresetRoute> = [{
    path: '/summary',
    config_url: 'assets/presets/summary.json'
}, {
    path: '/lumi',
    config_url: 'assets/presets/lumi.json'
}, {
    title: 'TEST',
    path: '/test',
    config_url: 'assets/presets/test.json'
}, {
    title: 'PLT offline',
    path: '/plt_offline',
    config_url: 'assets/presets/plt_offline.json'
}];
