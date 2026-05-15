import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { VoData } from '@services/vo-data';
import { VoStrategyFactory } from '@services/vo-control-strategy/vo-strategy-factory';

@Component({
  selector: 'app-monocular-form',
  imports: [
    RouterModule,
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatTabsModule,
    MatButtonModule,
    MatButton,
  ],
  templateUrl: './form.html',
  styleUrl: './form.css',
})

export class MonocularForm {
  links = [
    { label: 'Stream', path: 'stream' },
    { label: 'From file', path: 'from-file' }
  ];

  activeLink = this.links[0];

  constructor(
    private voData: VoData, 
    private router: Router,
    private strategyFactory: VoStrategyFactory,
  ) {}

  onStartVo() {
    try {
      const strategy = this.strategyFactory.launchStrategy(this.router.url);
      strategy.launch();
    } catch (error) {
      console.error(error);
    }
  }

  disableStartVo(): boolean {
    try {
      const strategy = this.strategyFactory.readyStrategy(this.router.url);
      return strategy.ready();
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
