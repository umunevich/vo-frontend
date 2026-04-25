import { Routes } from '@angular/router';
import { MonocularVoPage } from './components/monocular-vo-page/monocular-vo-page';
import { MonocularVoAbout } from './components/monocular-vo-about/monocular-vo-about';

export const routes: Routes = [
    { path: 'monocular-visual-odometry/about', component: MonocularVoAbout, title: 'VO - About' },
    { path: 'monocular-visual-odometry/:video-source', component: MonocularVoPage, title: 'VO - Form'},
    { path: '**', redirectTo: '/monocular-visual-odometry/' },
];


