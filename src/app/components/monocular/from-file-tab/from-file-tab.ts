import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/select';
import { VoFormData } from '@services/vo-form-data';
import { CameraProfileControls } from '@components/shared/camera-profile-controls/camera-profile-controls';

@Component({
  selector: 'app-from-file-tab',
  imports: [
    MatFormField,
    MatLabel,
    MatIcon,
    MatInputModule,
    MatButton,
    CameraProfileControls,
  ],
  templateUrl: './from-file-tab.html',
  styleUrl: './from-file-tab.css',
})
export class FromFileTab {
  selectedFileName = '';

  constructor(private voFormData: VoFormData) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFileName = file.name;
      this.voFormData.selectedFile.set(file);
    }
  }
}
