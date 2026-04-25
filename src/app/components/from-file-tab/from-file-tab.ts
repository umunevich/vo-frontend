import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/select';

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
  selectedFile: File | null = null

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      console.log('Обрано відео для VO:', this.selectedFileName);
    }
  }
}
