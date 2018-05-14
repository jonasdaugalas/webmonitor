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
    title: 'BPTX',
    path: '/bptx',
    config_url: 'assets/presets/bptx-es2.json'
}, {
    title: 'BPTX -ES6-',
    path: '/bptx-new',
    config_url: 'assets/presets/bptx.json'
}, {
    title: 'PLT offline',
    path: '/plt_offline',
    config_url: 'assets/presets/plt_offline.json'
}, {
    title: '-test-es2-es6-',
    path: '/test',
    config_url: 'assets/presets/test.json'
}];
