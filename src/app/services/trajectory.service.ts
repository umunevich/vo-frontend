import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  EuRoCSequenceInfo,
  TrajectoryEvaluateResponse,
  TrajectoryExportRequest,
  TrajectoryExportResponse,
  TrajectorySample,
} from '@entities/trajectory';

@Injectable({
  providedIn: 'root',
})
export class TrajectoryService {
  private readonly baseUrl = `${environment.voBackendApiUrl}/trajectory`;

  constructor(private http: HttpClient) {}

  listEuRoCSequences(): Observable<EuRoCSequenceInfo[]> {
    return this.http.get<EuRoCSequenceInfo[]>(`${this.baseUrl}/euroc-sequences`);
  }

  exportTum(request: TrajectoryExportRequest): Observable<TrajectoryExportResponse> {
    return this.http.post<TrajectoryExportResponse>(`${this.baseUrl}/export-tum`, request);
  }

  evaluateAgainstEuRoC(
    samples: TrajectorySample[],
    sequenceId: string,
  ): Observable<TrajectoryEvaluateResponse> {
    return this.http.post<TrajectoryEvaluateResponse>(`${this.baseUrl}/evaluate`, {
      samples,
      sequence_id: sequenceId,
    });
  }

  downloadText(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
