import { Router } from 'solid-app-router';
import type { Component } from 'solid-js';

import Root from './Root';

const App: Component = () => {
    return <Router>
        <ion-app>
            <Root />
        </ion-app>
    </Router>;
};

export default App;
