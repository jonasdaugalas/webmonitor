export const SANDBOX_PATH = '/--sandbox';

export class PresetRoute {
    title?: string;
    path: string;
    config_url: string;
}

export const ROUTES: Array<PresetRoute> = [{
    title: 'BPTX',
    path: '/bptx',
    config_url: 'assets/presets/bptx-es2.json'
}, {
    title: 'BPTX -Elasticsearch 6 test-',
    path: '/bptx-new',
    config_url: 'assets/presets/bptx.json'
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
