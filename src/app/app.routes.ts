import { Routes } from '@angular/router';
import { MonocularVoForm } from './components/monocular-vo-form/monocular-vo-form';
import { MonocularVoAbout } from './components/monocular-vo-about/monocular-vo-about';

export const routes: Routes = [
    { path: 'monocular-visual-odometry/about', component: MonocularVoAbout, title: 'VO - About' },
    { path: 'monocular-visual-odometry/:video-source', component: MonocularVoForm, title: 'VO - Form'},
    { path: '**', redirectTo: '/monocular-visual-odometry/' },
];


