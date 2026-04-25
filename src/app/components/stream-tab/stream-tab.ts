import { Component } from '@angular/core';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-stream-tab',
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
  ],
  templateUrl: './stream-tab.html',
  styleUrl: './stream-tab.css',
})
export class StreamTab {}
