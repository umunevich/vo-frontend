import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  CalibrationResult,
  CameraProfilePayload,
  CameraProfileSummary,
  CreateProfileResponse,
} from '@entities/camera-profile';

@Injectable({
  providedIn: 'root',
})
export class CameraProfileService {
  private readonly baseUrl = `${environment.voBackendApiUrl}/configs`;

  constructor(private http: HttpClient) {}

  listProfiles(): Observable<CameraProfileSummary[]> {
    return this.http.get<CameraProfileSummary[]>(this.baseUrl);
  }

  calibrateFromImages(
    files: File[],
    innerCornersCols: number,
    innerCornersRows: number,
    squareSizeMm: number,
  ): Observable<CalibrationResult> {
    const formData = new FormData();
    formData.append('inner_corners_cols', String(innerCornersCols));
    formData.append('inner_corners_rows', String(innerCornersRows));
    formData.append('square_size_mm', String(squareSizeMm));

    for (const file of files) {
      formData.append('images', file, file.name);
    }

    return this.http.post<CalibrationResult>(`${this.baseUrl}/calibrate`, formData);
  }

  createProfile(payload: CameraProfilePayload): Observable<CreateProfileResponse> {
    return this.http.post<CreateProfileResponse>(this.baseUrl, payload);
  }
}
