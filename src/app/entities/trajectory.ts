export interface TrajectorySample {
  frame_index: number;
  x: number;
  y: number;
  z: number;
  confidence?: number;
  tracking?: string;
}

export interface EuRoCSequenceInfo {
  id: string;
  label: string;
  available: boolean;
}

export interface TrajectoryExportRequest {
  samples: TrajectorySample[];
  sequence_id?: string | null;
  fps?: number;
  apply_global_scale?: boolean;
}

export interface TrajectoryExportResponse {
  filename: string;
  content: string;
  format: string;
}

export interface TrajectoryEvaluateResponse {
  sequence_id: string;
  sequence_label: string;
  n_samples: number;
  global_scale: number;
  ate_rmse_m: number;
  ate_mean_m: number;
  ate_median_m: number;
  ate_max_m: number;
  gt_path_length_m: number;
  est_path_length_raw: number;
  est_path_length_scaled_m: number;
  end_error_m: number;
  drift_pct: number;
  tum_raw: string;
  tum_scaled: string;
  scaled_positions: number[][];
}
