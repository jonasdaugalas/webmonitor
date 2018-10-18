import {
    Component, OnInit, Input, ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FormlyFieldConfig } from '@ngx-formly/core';
import * as ChartUtils from 'app/shared/chart-utils';
import * as Stats from 'app/shared/stats';
import { ArraySnapshotComponent } from '../array-snapshot/array-snapshot.component';
import { ChartWidget } from 'app/widgets/base/chart-widget';

declare var Plotly: any;

@Component({
    selector: 'wm-pileup-widget',
    templateUrl: '../array-snapshot/array-snapshot.component.html',
    styleUrls: ['../array-snapshot/array-snapshot.component.css']
})
export class PileupComponent extends ArraySnapshotComponent implements OnInit {

    public static HISTOGRAM_STEP_DEFAULT = 2;
    public static MINBIAS_DEFAULT = 80000;
    public static STATISTICS_FILTER_DEFAULT = 1.0;

    pileups: Array<number>;
    lastData = null;

    ngOnInit() {
        const wi = (<ChartWidget>this).config['widget'];
        const wr = (<ChartWidget>this).config['wrapper'];
        wi['xAxisTitle'] = wi['xAxisTitle'] || 'Pileup';
        wi['yAxisTitle'] = wi['yAxisTitle'] || 'Frequency (interactions)';
        wi['histogramStep'] = wi['histogramStep'] || PileupComponent.HISTOGRAM_STEP_DEFAULT;
        wi['minbias'] = wi['minbias'] || PileupComponent.MINBIAS_DEFAULT;
        wi['statisticsFilter'] = wi['statisticsFilter'] || PileupComponent.STATISTICS_FILTER_DEFAULT;
        wr['infoEnabled'] = true;
        super.ngOnInit();
        if (this.queryParams.fields.length !== 1) {
            const msg = 'Pileup chart must have single field configured';
            console.error(msg, wi);
            throw(msg);
        }
        this.setupPileupOptions();
    }

    setData(newData) {
        this.lastData = newData;
        const cw = <ChartWidget>this;
        const wi = cw.config['widget'];
        if (!newData[0]) {
            cw.widgetWrapper.log('Cannot draw chart: no data.', 'danger', 3500);
            return;
        }
        (<ChartWidget>this).chartData.length = 0;
        this.series.length = 0;
        const field = this.queryParams.fields[0];
        this.pileups = newData[0][field.name].map(value => value * wi['minbias'] / 11245.0);
        const y = [];
        this.pileups.forEach(pu => {
            const bin = Math.floor(pu/wi['histogramStep']);
            if (y[bin]) {
                y[bin] += 1;
            } else {
                y[bin] = 1;
            }
        });
        const x = y.map((val, i) => i * wi['histogramStep']);
        const newSeries = {
            x: x,
            y: y,
            name: field.seriesName,
            type: 'bar',
            mode: 'markers',
            marker: { size: 5 }
        };
        cw.chartData.push(newSeries);
        this.series.push(newSeries);
        this.updateAnnotation(newData);
        ChartUtils.setAutorange(cw.chartLayout)
        Plotly.redraw(cw.plot.nativeElement, cw.chartData, cw.chartLayout);
        this.updateInfo(newData);
    }

    updateInfo(newData) {
        super.updateInfo(newData);
        const wi = (<ChartWidget>this).config['widget'];
        const stats = this.calculateStatistics();
        (<any>Object).assign(this.info, {
            'MinBiasXSec.': wi['minbias'],
            'Bin size': wi['histogramStep'],
            'Stats filter': '>=' + wi['statisticsFilter'],
            'nBX': stats.filteredBX,
            'Mean': stats.mean.toFixed(6),
            'Std.deviation': stats.stdDeviation.toFixed(6)
        });
    }

    calculateStatistics() {
        const wi = (<ChartWidget>this).config['widget'];
        const filtered = this.pileups.filter(v => v >= wi['statisticsFilter']);
        const filteredBX = filtered.length;
        const mean = Stats.mean(filtered);
        const stdDev = Stats.standardDeviation(filtered);
        return {
            filteredBX: filtered.length,
            mean: Stats.mean(filtered),
            stdDeviation: Stats.standardDeviation(filtered)
        };
    }

    protected setupPileupOptions() {
        const cw = <ChartWidget>this;
        const wi = cw.config['widget'];
        const pileupOptions: Array<FormlyFieldConfig> = [{
            key: 'histogramStep', type: 'number', templateOptions: {label: 'Histogram step'}
        }, {
            key: 'minbias', type: 'number', templateOptions: {label: 'Minbias'}
        }, {
            key: 'statisticsFilter', type: 'number', templateOptions: {label: 'Statistics filter', min: 0, step: 0.1}
        }];
        if (cw.widgetWrapper.extraOptions && cw.widgetWrapper.extraOptions.length) {
            cw.widgetWrapper.extraOptions = cw.widgetWrapper.extraOptions.concat(pileupOptions);
        } else {
            cw.widgetWrapper.extraOptions = pileupOptions;
        }
        cw.widgetWrapper.extraOptionsModel = (<any>Object).assign(
            {},
            cw.widgetWrapper.extraOptionsModel,
            {
                'histogramStep': wi['histogramStep'],
                'minbias': wi['minbias'],
                'statisticsFilter': wi['statisticsFilter']
            }
        );
        cw.widgetWrapper.extraOptionsModelChange.pipe(debounceTime(1000)).subscribe(model => {
            wi['histogramStep'] = model['histogramStep'];
            wi['minbias'] = model['minbias'];
            wi['statisticsFilter'] = model['statisticsFilter'];
            this.setData(this.lastData);
        });

    }

}
