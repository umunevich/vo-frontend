import { Component, computed, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterModule } from '@angular/router';
import { VoRouter } from '@entities/vo-router';
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

  startDisabled = computed(() => {
    try {
      const strategy = this.strategyFactory.readyStrategy(this.voRouter.url);
      return !strategy.ready();
    } catch (error) {
      console.error(error);
      return true;
    }
  });

  constructor(
    @Inject(VoRouter) private voRouter: VoRouter,
    private strategyFactory: VoStrategyFactory,
  ) {}

  onStartVo(): void {
    try {
      const strategy = this.strategyFactory.startStrategy(this.voRouter.url);
      strategy.launch();
    } catch (error) {
      console.error(error);
    }
  }

  onSwitchTab(link: { label: string, path: string }): void {
    try {
      this.switchOn(link.path);
      this.activeLink = link;
    } catch (error) {
      console.error(error);
    }
  }

  private switchOn(url: string): void {
    const strategy = this.strategyFactory.switchStrategy(url);
    strategy.switchOn();
  }
}
