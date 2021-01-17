import { SourceInfo } from "../Types"

//const baseUrl = 'http://localhost:8787/' // Default local dev url of ../api project
const baseUrl = 'https://rageagain.pjgalbraith.workers.dev/' // Must have trailing slash

export const getTrackSources = (artist: string, song: string): Promise<SourceInfo[]> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: baseUrl + 'api/musicvideosearch',
      dataType: 'json',
      data: { artist, song },
      success: (data: SourceInfo[]) => resolve(data),
      error: (_jqXHR, textStatus, errorThrown) => {
        reject(textStatus + ': ' + errorThrown)
      }
    })
  })
}