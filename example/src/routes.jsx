import React from 'react';
import {Route, IndexRoute} from 'react-router';

import AppHandler from 'components/AppHandler';
import ErrorHandler from 'components/ErrorHandler';
import ContentsPage from 'components/ContentsPage';
import Demo from 'components/Demo';



const routes = <Route component={AppHandler} path="/">
    <IndexRoute component={ContentsPage} />
    <Route path="/demo" component={Demo}/>
    <Route path="*" component={ErrorHandler}/>
</Route>;

export default routes;
