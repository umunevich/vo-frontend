import { Component } from '@angular/core';
import { MonocularForm } from "../form/form";
import { MatButton } from '@angular/material/button';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-monocular-vo-page',
  imports: [
    MonocularForm,
    MatButton,
    RouterLink
],
  templateUrl: './page.html',
  styleUrl: './page.css',
})
export class MonocularPage {
  
}
