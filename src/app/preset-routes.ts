export class PresetRoute {
    title: string;
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
}];
