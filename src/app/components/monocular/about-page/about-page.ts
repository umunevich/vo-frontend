import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Location } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-monocular-about-page',
  standalone: true,
  imports: [
    MarkdownComponent,
    MatButtonModule
  ],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
})
export class AboutPage implements OnInit {
  constructor(private location: Location) {}

  private http = inject(HttpClient);
  markdownContent = signal<string>('Loading project documentation...');

  ngOnInit() {
    this.http.get(environment.githubRawAboutUrl, { responseType: 'text' }).subscribe({
      next: (text) => this.markdownContent.set(text),
      error: (err) => {
        console.error('Failed to fetch ABOUT.md from GitHub', err);
        this.markdownContent.set('Failed to load documentation. Please try again later.');
      }
    });
  }

    goBack(): void {
    this.location.back()
  }
}