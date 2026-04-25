import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';

@Component({
  selector: 'app-monocular-vo-form',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatTabGroup,
    MatTab,
    MatFormField,
    MatLabel,
    MatButton,
    MatSelect,
    MatOption
  ],
  templateUrl: './monocular-vo-form.html',
  styleUrl: './monocular-vo-form.css',
})

export class MonocularVoForm {}
