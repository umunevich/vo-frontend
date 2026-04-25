import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

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
}
