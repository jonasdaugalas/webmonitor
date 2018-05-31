export const SANDBOX_PATH = '/--sandbox';

export class PresetRoute {
    title?: string;
    path: string;
    config_url: string;
}

export const ROUTES: Array<PresetRoute> = [{
    title: 'Summary',
    path: '/summary',
    config_url: 'assets/presets/summary.json'
}, {
    title: 'BPTX',
    path: '/bptx',
    config_url: 'assets/presets/bptx-es2.json'
}, {
    title: 'PLT',
    path: '/plt',
    config_url: 'assets/presets/plt.json'
}, {
    title: 'PLT offline',
    path: '/plt_offline',
    config_url: 'assets/presets/plt_offline.json'
}, {
    path: '/test',
    config_url: 'assets/presets/test.json'
}];
