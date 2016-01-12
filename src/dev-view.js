import env from 'env';

import {display} from 'index';
import 'themes/default/dev-styles.css!';

let rendererConfig = {
  rendererBaseUrl: '',
}

var myItemFakeData = {

}

display(myItemFakeData, document.getElementById('my-q-item'), rendererConfig);
