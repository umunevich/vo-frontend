import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/select';
import { VoData } from '../services/vo-data';

@Component({
  selector: 'app-from-file-tab',
  imports: [
    MatFormField,
    MatLabel,
    MatIcon,
    MatInputModule,
    MatButton,
  ],
  templateUrl: './from-file-tab.html',
  styleUrl: './from-file-tab.css',
})
export class FromFileTab {
  selectedFileName: string = ''

  constructor(private voData: VoData) {
    this.selectedFileName = voData.selectedFile?.name ?? '';
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.voData.selectedFile = file;
    }
  }
}
