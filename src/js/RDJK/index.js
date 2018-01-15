import React from 'react';
import ReactDOM from 'react-dom';
//redux
import { Provider } from 'react-redux';
//redux store
import store from '../../redux/store';

import RDJK from './RDJK';

ReactDOM.render(
    <Provider store={store}>
        <RDJK />
    </Provider>
, document.getElementById('rdjk-root'));