import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VoFormData } from '@services/vo-form-data';
import { CameraProfileService } from '@services/camera-profile.service';
import { CameraProfileSummary } from '@entities/camera-profile';
import { CreateConfigDialog } from '@components/modals/create-config-dialog/create-config-dialog';

@Component({
  selector: 'app-camera-profile-controls',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatTooltipModule,
  ],
  templateUrl: './camera-profile-controls.html',
  styleUrl: './camera-profile-controls.css',
})
export class CameraProfileControls implements OnInit {
  profiles = signal<CameraProfileSummary[]>([]);
  selectedConfigId = signal<string | null>(null);
  loading = signal(false);

  constructor(
    private voFormData: VoFormData,
    private cameraProfiles: CameraProfileService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.reloadProfiles();
  }

  reloadProfiles(): void {
    this.loading.set(true);
    this.cameraProfiles.listProfiles().subscribe({
      next: (profiles) => {
        this.profiles.set(profiles);
        this.loading.set(false);

        const current = this.voFormData.selectedConfigId();
        if (current && profiles.some((profile) => profile.id === current)) {
          this.selectedConfigId.set(current);
          return;
        }

        if (profiles.length > 0) {
          this.selectProfile(profiles[0].id);
        }
      },
      error: (err) => {
        console.error('[CameraProfileControls] Failed to load profiles:', err);
        this.loading.set(false);
      },
    });
  }

  onProfileChange(configId: string): void {
    this.selectProfile(configId);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateConfigDialog, {
      width: '560px',
      maxHeight: '90vh',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created?.id) {
        this.reloadProfiles();
        this.selectProfile(created.id);
      }
    });
  }

  private selectProfile(configId: string): void {
    this.selectedConfigId.set(configId);
    this.voFormData.selectedConfigId.set(configId);
  }
}
