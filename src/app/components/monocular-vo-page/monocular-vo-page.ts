import { Component } from '@angular/core';
import { MonocularVoForm } from "../monocular-vo-form/monocular-vo-form";
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-monocular-vo-page',
  imports: [
    MonocularVoForm,
    MatButton
  ],
  templateUrl: './monocular-vo-page.html',
  styleUrl: './monocular-vo-page.css',
})
export class MonocularVoPage {}
