import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DomSanitizer } from '@angular/platform-browser';
import { WidgetComponent } from 'app/shared/widget/widget.component';
import {
    DataService, Parameters as QueryParamters, MAX_QUERY_SIZE
} from './data.service';

interface WidgetConfig {
    database: string;
    index: string;
    useDocumentType: boolean;
    typeField?: string;
    imageDataField: string;
    timestampField?: string;
    timestampFormat?: 's' | 'ms' | 'string';
    imageWidth?: number;
    sortBy?: string;
    groupBy?: string;
    metaFields: {string: MetaField};
    queryConfig: QueryConfig;
}

interface MetaField {
    type: string;
    label: string;
}

interface QueryConfig {
    typesDisabled?: boolean;
    typeSelectionTitle?: string;
    availableTypes?: Array<string>;
    featuresDisabled?: boolean;
    featuresSelectionTitle?: string;
    featuresSelectionFormFields?: Array<FormlyFieldConfig>;
    querySelectionTitle?: string;
    availableQueries: Array<Query>;
}

interface Query {
    type: 'daterange' | 'range' | 'list';
    label: string;
    field?: string;
    fieldType?: 'number' | 'string';
}

@Component({
    templateUrl: './binary-images.component.html',
    styleUrls: ['./binary-images.component.css']
})
export class BinaryImagesComponent implements OnInit {

    @ViewChild('widgetWrapper') widgetWrapper: WidgetComponent;
    @Input('config') config;
    wi: WidgetConfig;

    metaFields: {string: MetaField} = <{string: MetaField}>{};
    metaFieldsKeys: Array<string>;

    filtersFormModel = {};
    filtersFormFields: Array<FormlyFieldConfig> = [];

    groupByOptions = [];
    sortByOptions = [];

    selectedTypes = [];
    featuresSelectionModel = {};
    selectedQuery;

    images = [];
    groupedImages = [];

    queryConfig: QueryConfig;

    readonly max_query_size = MAX_QUERY_SIZE;

    constructor(
        protected dataService: DataService,
        protected sanatizer: DomSanitizer) {
    }

    ngOnInit() {
        this.wi = <WidgetConfig>this.config['widget'];
        this.metaFields = <{string: MetaField}>(this.wi.metaFields || {});
        this.metaFieldsKeys = Object.keys(this.metaFields);
        this.filtersFormFields = this.makeFiltersFormFields();
        this.groupByOptions = this.metaFieldsKeys.map(key => {
            return {value: key, label: this.metaFields[key]['label']}
        })
        if (this.wi.timestampField) {
            this.groupByOptions.push({value: this.wi.timestampField, label: 'Timestamp'});
        }
        this.sortByOptions = this.groupByOptions;
        this.setupQueryConfig();
    }

    setupQueryConfig() {
        const qc: QueryConfig =
            this.wi['queryConfig'] = this.queryConfig = <QueryConfig>(this.wi['queryConfig'] || {});
        if (!qc.typesDisabled) {
            qc.typeSelectionTitle = qc.typeSelectionTitle || 'Image types';
            qc.availableTypes = qc.availableTypes || [];
        }
        if (!qc.featuresDisabled) {
            qc.featuresSelectionTitle = qc.featuresSelectionTitle || 'Conditions';
            qc.featuresSelectionFormFields = qc.featuresSelectionFormFields || [];
        }
        qc.querySelectionTitle = qc.querySelectionTitle || 'Query type';
        qc.availableQueries = <Array<Query>>(
            qc.availableQueries || [{type: 'daterange', label: 'Date range'}]);
        this.selectedQuery = qc.availableQueries[0];
    }

    makeQueryParameters(): QueryParamters {
        const terms = this.extractFeaturesTerms();
        return {
            database: this.wi.database,
            index: this.wi.index,
            useDocumentType: this.wi.useDocumentType,
            typeField: this.wi.typeField,
            timestampField: this.wi.timestampField,
            fields: this.metaFieldsKeys.concat([this.wi.imageDataField]),
            types: this.selectedTypes.length > 0 ? this.selectedTypes.map(t => t['name']) : undefined,
            singleTerms: terms.singleTerms,
            multiTerms: terms.multiTerms
        };
    }

    extractFeaturesTerms() {
        const singleTerms = <{string: any}>{};
        const multiTerms = <{string: Array<any>}>{};
        this.queryConfig.featuresSelectionFormFields.forEach(field => {
            if (typeof this.featuresSelectionModel[field.key] === 'undefined') {
                return;
            }
            const value = this.featuresSelectionModel[field.key];
            if (value.hasOwnProperty('length') && value.length < 1) {
                // ignoring empty arrays and strings
                return;
            }
            if (['number', 'string'].includes(field.type)) {
                singleTerms[field.key] = value;
            } else if (['delimited-numbers', 'delimited-strings'].includes(field.type)) {
                multiTerms[field.key] = value;
            } else {
                throw Error('Unsupported field type: ' + field.type);
            }
        });
        return {
            singleTerms: Object.keys(singleTerms).length > 0 ? singleTerms : undefined,
            multiTerms: Object.keys(multiTerms).length > 0 ? multiTerms : undefined
        }
    }


    onRangeConditionQuery(event: {key: string, min: any, max: any}) {
        if (typeof event.min == 'undefined' || typeof event.max == 'undefined') {
            this.widgetWrapper.log('Min and max must be set for a range query', 'danger', 3000);
            return;
        }
        const params = this.makeQueryParameters();
        this.dataService
            .queryRange(params, event.key, event.min, event.max)
            .subscribe(result => {
                this.images = this.parseImages(result);
                this.updateImageGroups();
            });
    }

    onListConditionQuery(event: {key: string, value: Array<any>}) {
        if (!Array.isArray(event.value)) {
            this.widgetWrapper.log('Array of values is needed for a list query', 'danger', 3000);
            return;
        } else if (event.value.length == 0) {
            this.widgetWrapper.log('List cannot be empty', 'danger', 3000);
            return;
        }
        console.log(event);
        const params = this.makeQueryParameters();
        if (typeof params.multiTerms == 'undefined') {
            const terms = <{string: Array<any>}>{};
            terms[event.key] = event.value;
            params.multiTerms = terms;
        } else {
            params.multiTerms[event.key] = event.value;
        }
        this.dataService
            .query(params)
            .subscribe(result => {
                this.images = this.parseImages(result);
                this.updateImageGroups();
            });
    }

    onDateRangeQuery(event) {
        if (!this.wi.timestampField) {
            throw Error('Cannot perform date range query without timestampField');
        }
        const params = this.makeQueryParameters();
        let t_from;
        let t_to;
        if (this.wi.timestampFormat === 's') {
            t_from = event.tsFrom;
            t_to = event.tsTo;
        } else if (this.wi.timestampFormat === 'ms') {
            t_from = event.msecFrom;
            t_to = event.msecTo;
        } else if (this.wi.timestampFormat === 'string') {
            t_from = event.strFrom;
            t_to = event.strTo;
        }
        this.dataService
            .queryRange(params, this.wi.timestampField, t_from, t_to)
            .subscribe(result => {
                this.images = this.parseImages(result);
                this.updateImageGroups();
            });
    }

    parseImages(response) {
        return response.map(image => {
            return {
                src: this.sanatizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + image['img']),
                meta: this.extractMetadata(image)
            }
        });
    }

    updateImageGroups() {
        const groupBy = this.wi.groupBy;
        const filtered = this.filterImages();
        if (groupBy) {
            let groupNameFormatter = (group) => group;
            if (groupBy === this.wi.timestampField) {
                groupNameFormatter = (group) => (<Date>group).toISOString();
            }
            const groups = {};
            filtered.forEach(img => {
                const group = groupNameFormatter(img['meta'][groupBy]);
                if (!groups.hasOwnProperty(group)) {
                    groups[group] = [];
                }
                groups[group].push(img);
            })
            this.groupedImages = Object.keys(groups).map(key => {
                return {groupName: key, images: groups[key]};
            });
        } else {
            this.groupedImages = [{groupName: '', images: filtered}];
        }
        this.sortGroupedImages();
    }

    sortGroupedImages() {
        const sortBy = this.wi.sortBy;
        if (!sortBy) {
            return;
        }
        this.groupedImages.forEach(group => {
            group.images.sort((a, b) => {
                if (a['meta'][sortBy] < b['meta'][sortBy]) {
                    return -1;
                } else if (a['meta'][sortBy] > b['meta'][sortBy]) {
                    return 1;
                } else {
                    return 0;
                }
            });
        });
    }

    extractMetadata(image) {
        const metadata = {};
        this.metaFieldsKeys.forEach(f => {
            metadata[f] = image[f];
        });
        if (this.wi.timestampField) {
            if (this.wi.timestampFormat === 's') {
                metadata[this.wi.timestampField] =
                    new Date(image[this.wi.timestampField] * 1000);
            } else {
                metadata[this.wi.timestampField] =
                    new Date(image[this.wi.timestampField]);
            }
        }
        return metadata;
    }

    makeFiltersFormFields() {
        const fields = [];
        this.metaFieldsKeys.forEach(key => {
            if (!['number', 'string'].includes(this.metaFields[key].type)) {
                return;
            }
            fields.push({
                key: key,
                type: this.metaFields[key]['type'],
                templateOptions: {label: this.metaFields[key]['label']}
            });
        });
        return fields;
    }

    filterImages() {
        let filtered = this.images;
        this.metaFieldsKeys.forEach(key => {
            if (this.filtersFormModel.hasOwnProperty(key)) {
                const filterValue = this.filtersFormModel[key];
                if (filterValue === null) {
                    return;
                }
                if (this.metaFields[key].type == 'string') {
                    filtered = filtered.filter(img => img['meta'][key].includes(filterValue));
                } else {
                    filtered = filtered.filter(img => img['meta'][key] == filterValue);
                }
            }
        });
        return filtered;
    }

    onClickApplyFilters() {
        this.updateImageGroups();
    }

    onClickClearFilters() {
        this.filtersFormModel = {};
        this.updateImageGroups();
    }

}
