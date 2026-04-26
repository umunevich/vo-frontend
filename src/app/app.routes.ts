import { Routes } from '@angular/router';
import { MonocularVoPage } from './components/monocular-vo-page/monocular-vo-page';
import { MonocularVoAbout } from './components/monocular-vo-about/monocular-vo-about';
import { StreamTab } from './components/stream-tab/stream-tab';
import { FromFileTab } from './from-file-tab/from-file-tab';
import { VoWorkspace } from './components/vo-workspace/vo-workspace';

export const routes: Routes = [
    { path: 'monocular-visual-odometry/about', component: MonocularVoAbout, title: 'VO - About' },
    { path: 'monocular-visual-odometry/workspace', component: VoWorkspace, title: 'VO - Workspace' },
    { 
        path: 'monocular-visual-odometry', 
        component: MonocularVoPage, title: 'VO - Form',
        children: [
            { path: 'stream', component: StreamTab },
            { path: 'from-file', component: FromFileTab },
            { path: '**', redirectTo: 'stream' },
        ]
    },
    { path: '**', redirectTo: '/monocular-visual-odometry/stream' },
];


