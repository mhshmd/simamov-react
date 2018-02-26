import React from 'react';
import ReactDOM from 'react-dom';
//redux
import { Provider } from 'react-redux';
//redux store
import store from '../../redux/store';

import PerhitunganSurtug from './PerhitunganSurtug';

ReactDOM.render(
    <Provider store={store}>
        <PerhitunganSurtug />
    </Provider>
, document.getElementById('perhit-surtug-root'));