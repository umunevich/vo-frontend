export interface CameraProfileSummary {
  id: string;
  name: string;
}

export interface CameraIntrinsics {
  fu: number;
  fv: number;
  cu: number;
  cv: number;
}

export interface CalibrationResult {
  camera: CameraIntrinsics;
  distortion: number[];
  reprojection_error: number;
  images_used: number;
  image_width: number;
  image_height: number;
  inner_corners_cols: number;
  inner_corners_rows: number;
  pattern_auto_detected?: boolean;
}

export interface CameraProfilePayload {
  name: string;
  camera: CameraIntrinsics;
  distortion?: number[];
  calibration?: {
    source: string;
    inner_corners_cols?: number;
    inner_corners_rows?: number;
    square_size_m?: number;
    reprojection_error?: number;
    images_used?: number;
    image_width?: number;
    image_height?: number;
  };
}

export interface CreateProfileResponse {
  status: string;
  id: string;
  message: string;
}
