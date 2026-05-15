import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class VoRouter {
  constructor(
    @Inject(Router) private router: Router
  ) {}

  get url(): string {
    return this.router.url;
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
