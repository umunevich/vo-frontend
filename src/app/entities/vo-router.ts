import { Inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VoRouter {
  readonly url: Signal<string>

  constructor(
    @Inject(Router) private router: Router
  ) {
    this.url = toSignal(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url)
      ),
      { initialValue: this.router.url }
    );
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
