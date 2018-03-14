import { widgetModuleSelector } from 'app/widgets/widget-module-selector';

export const SCHEMA = {
    definitions: {
        widget: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: Object.keys(widgetModuleSelector)
                },
                config: { '$ref': '#/definitions/widget_config'}
            },
            required: ['type', 'config'],
            additionalProperties: false
        },
        widget_config: {
            type: 'object',
            properties: {
                container: { type: 'object'},
                wrapper: { type: 'object'},
                widget: { type: 'object'}
            },
            additionalProperties: false
        }
    },
    type: 'object',
    properties: {
        timers: {
            type: 'array',
            items: { type: 'number'},
            description: 'Array of intervals in seconds'
        },
        widgets: {
            type: 'array',
            minItems: 1,
            items: { '$ref': '#/definitions/widget'}
        }
    },
    required: ['widgets'],
    additionalProperties: false
};
