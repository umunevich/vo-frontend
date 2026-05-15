import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-base-workspace',
  imports: [
    RouterModule,
    MatButtonModule
  ],
  templateUrl: './base.html',
  styleUrl: './base.css',
})
export class BaseWorkspace {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back()
  }
}
