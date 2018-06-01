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
    title: 'Luminosity',
    path: '/lumi',
    config_url: 'assets/presets/lumi.json'
}, {
    title: 'Per bunch luminosity',
    path: '/bxlumi',
    config_url: 'assets/presets/bxlumi.json'
}, {
    title: 'BPTX',
    path: '/bptx',
    config_url: 'assets/presets/bptx-es2.json'
}, {
    title: 'BCML',
    path: '/bcml',
    config_url: 'assets/presets/bcml.json'
}, {
    title: 'BCM1F RHU',
    path: '/bcm1frhu',
    config_url: 'assets/presets/bcm1frhu.json'
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
