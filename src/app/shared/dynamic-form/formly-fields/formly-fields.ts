import { NumberComponent } from './number/number.component';
import { StringComponent } from './string/string.component';
import { DelimitedComponent } from './delimited/delimited.component';

export const FORMLY_FIELDS_CONFIG = {
    types: [
        {name: 'number', component: NumberComponent},
        {name: 'string', component: StringComponent},
        {name: 'delimited-strings', component: DelimitedComponent},
        {name: 'delimited-numbers', component: DelimitedComponent}
    ]
};
