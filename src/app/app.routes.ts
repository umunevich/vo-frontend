import { Routes } from '@angular/router';
import { MonocularPage } from '@components/monocular/vo-page/vo-page';
import { AboutPage } from '@components/monocular/about-page/about-page';
import { StreamTab } from './components/monocular/stream-tab/stream-tab';
import { FromFileTab } from '@components/monocular/from-file-tab/from-file-tab';
import { StreamWorkspace } from './components/workspaces/stream/stream';
import { FromFileWorkspace } from './components/workspaces/from-file/from-file';
import { BaseWorkspace } from './components/workspaces/base/base';

export const routes: Routes = [
    { path: 'monocular-visual-odometry/about', component: AboutPage, title: 'VO - About' },
    { 
        path: 'monocular-visual-odometry/workspace', 
        component: BaseWorkspace, title: 'VO - Workspace',
        children: [
            { path: 'stream', component: StreamWorkspace },
            { path: 'from-file', component: FromFileWorkspace },
            { path: '**', redirectTo: 'stream' },
        ]
    },
    { 
        path: 'monocular-visual-odometry', 
        component: MonocularPage, title: 'VO - Form',
        children: [
            { path: 'stream', component: StreamTab },
            { path: 'from-file', component: FromFileTab },
            { path: '**', redirectTo: 'stream' },
        ]
    },
    { path: '**', redirectTo: '/monocular-visual-odometry/stream' },
];


