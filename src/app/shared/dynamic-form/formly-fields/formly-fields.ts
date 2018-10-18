import { NumberComponent } from './number/number.component';
import { StringComponent } from './string/string.component';

export const FORMLY_FIELDS_CONFIG = {
    types: [
        {name: 'number', component: NumberComponent},
        {name: 'string', component: StringComponent}
    ]
};
