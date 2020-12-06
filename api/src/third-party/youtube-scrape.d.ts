
export interface Video {
  id: string;
  title: string;
  url: string;
  duration: string;
  snippet: string;
  upload_date: string;
  thumbnail_src: string;
  views: string;
}

export interface Uploader {
  username: string;
  url: string;
  verified: boolean;
}

export interface Radio {
  id: string;
  title: string;
  url: string;
  thumbnail_src: string;
  video_count: string;
}

export interface Result {
  video?: Video;
  uploader?: Uploader;
  radio?: Radio;
  channel?: any;
  playlist?: any;
}

export interface Response {
  results: Result[];
  version: string;
  parser: string;
  key: string;
  estimatedResults: string;
  nextPageToken: string;
}

export interface ErrorResponse {
  error: string
}

export function youtube(query: string): Promise<Response | ErrorResponse>
export function youtube(query: undefined, key: string, pageToken: string): Promise<Response | ErrorResponse>