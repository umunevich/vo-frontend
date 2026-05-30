import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CameraProfileService } from '@services/camera-profile.service';
import { CalibrationResult, CameraProfilePayload } from '@entities/camera-profile';

@Component({
  selector: 'app-create-config-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    DecimalPipe,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './create-config-dialog.html',
  styleUrl: './create-config-dialog.css',
})
export class CreateConfigDialog {
  readonly calibrating = signal(false);
  readonly saving = signal(false);
  readonly calibrationError = signal<string | null>(null);
  readonly calibrationResult = signal<CalibrationResult | null>(null);
  readonly selectedImageCount = signal(0);

  configForm: FormGroup;
  calibrationFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateConfigDialog>,
    private cameraProfiles: CameraProfileService,
  ) {
    this.configForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      inner_corners_cols: [6, [Validators.required, Validators.min(3)]],
      inner_corners_rows: [7, [Validators.required, Validators.min(3)]],
      square_size_mm: [38, [Validators.required, Validators.min(0.1)]],
      camera: this.fb.group({
        fu: [{ value: 0, disabled: true }, [Validators.required, Validators.min(1)]],
        fv: [{ value: 0, disabled: true }, [Validators.required, Validators.min(1)]],
        cu: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
        cv: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      }),
    });
  }

  onCalibrationImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.calibrationFiles = files.filter((file) => this.isImageFile(file));
    this.selectedImageCount.set(this.calibrationFiles.length);
    this.calibrationError.set(null);
    input.value = '';
  }

  private isImageFile(file: File): boolean {
    if (file.type.startsWith('image/')) {
      return true;
    }
    return /\.(png|jpe?g|webp|bmp)$/i.test(file.name);
  }

  runCalibration(): void {
    const cols = this.configForm.get('inner_corners_cols')?.value;
    const rows = this.configForm.get('inner_corners_rows')?.value;
    const squareMm = this.configForm.get('square_size_mm')?.value;

    if (this.calibrationFiles.length < 3) {
      this.calibrationError.set('Select at least 3 chessboard photos (more is better).');
      return;
    }

    if (this.configForm.get('inner_corners_cols')?.invalid || this.configForm.get('inner_corners_rows')?.invalid) {
      this.calibrationError.set('Enter valid inner corner counts for your printed pattern.');
      return;
    }

    this.calibrating.set(true);
    this.calibrationError.set(null);

    this.cameraProfiles
      .calibrateFromImages(this.calibrationFiles, cols, rows, squareMm)
      .subscribe({
        next: (result) => {
          this.calibrationResult.set(result);
          this.configForm.patchValue({
            inner_corners_cols: result.inner_corners_cols,
            inner_corners_rows: result.inner_corners_rows,
          });
          this.configForm.get('camera')?.patchValue(result.camera);
          this.calibrating.set(false);
        },
        error: (err) => {
          const detail = err?.error?.detail;
          this.calibrationError.set(
            typeof detail === 'string' ? detail : 'Calibration failed. Check images and board settings.',
          );
          this.calibrating.set(false);
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    const result = this.calibrationResult();
    if (!result || this.configForm.get('name')?.invalid) {
      return;
    }

    const squareMm = this.configForm.get('square_size_mm')?.value;

    const payload: CameraProfilePayload = {
      name: this.configForm.get('name')?.value,
      camera: result.camera,
      distortion: result.distortion,
      calibration: {
        source: 'chessboard',
        inner_corners_cols: result.inner_corners_cols,
        inner_corners_rows: result.inner_corners_rows,
        square_size_m: squareMm / 1000,
        reprojection_error: result.reprojection_error,
        images_used: result.images_used,
        image_width: result.image_width,
        image_height: result.image_height,
      },
    };

    this.saving.set(true);
    this.cameraProfiles.createProfile(payload).subscribe({
      next: (response) => {
        this.saving.set(false);
        this.dialogRef.close(response);
      },
      error: (err) => {
        const detail = err?.error?.detail;
        this.calibrationError.set(
          typeof detail === 'string' ? detail : 'Could not save camera profile.',
        );
        this.saving.set(false);
      },
    });
  }

  canSave(): boolean {
    return Boolean(
      this.calibrationResult() && !this.saving() && this.configForm.get('name')?.valid,
    );
  }
}
