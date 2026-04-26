import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { VoData } from '../../services/vo-data';

@Component({
  selector: 'app-monocular-vo-form',
  imports: [
    RouterModule,
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatTabsModule,
    MatButtonModule,
    MatButton,
  ],
  templateUrl: './monocular-vo-form.html',
  styleUrl: './monocular-vo-form.css',
})

export class MonocularVoForm {
  links = [
    { label: 'Stream', path: 'stream' },
    { label: 'From file', path: 'from-file' }
  ];

  activeLink = this.links[0];

  constructor(
    private voData: VoData, 
    private router: Router
  ) {}

  onStartVo() {
    const currentUrl = this.router.url;

    if (currentUrl.includes('stream')) {
      console.log("Launch VO from camera: ", this.voData.selectedDevice);
    } else {
      console.log("Launch VO from file: ", this.voData.selectedFile);
    }
  }

  disableStartVo() {
    const currentUrl = this.router.url;

    if (currentUrl.includes('stream')) {
      return !this.voData.isReady('stream');
    } else {
      return !this.voData.isReady('file');
    }
  }
}
