import React from 'react';
import ReactDOM from 'react-dom';
//redux
import { Provider } from 'react-redux';
//redux store
import store from '../../redux/store';

import Surtug from './Surtug';

ReactDOM.render(
    <Provider store={store}>
        <Surtug />
    </Provider>
, document.getElementById('surtug-root'));