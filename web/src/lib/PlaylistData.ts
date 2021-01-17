import { DataIndex, Playlist } from "../Types"

//const baseUrl = 'http://localhost:8787/api/data/' // Default local dev url of ../api project
const baseUrl = 'https://rageagain.pjgalbraith.workers.dev/api/data/' // Must have trailing slash

let dataIndex: DataIndex = {
  playlists: []
}

export const getPlaylistIndex = (): Promise<DataIndex> => {
  if (dataIndex.playlists.length) {
    return Promise.resolve(dataIndex)
  }

  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: baseUrl + 'index.json',
      dataType: 'json',
      success: (data: DataIndex) => {
        dataIndex = data
        resolve(dataIndex)
      },
      error: (_jqXHR, textStatus, errorThrown) => {
        reject(textStatus + ': ' + errorThrown)
      }
    })
  })
}

export const getPlaylist = (path: string): Promise<Playlist> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: baseUrl + path,
      dataType: 'json',
      success: (data: Playlist) => resolve(data),
      error: (_jqXHR, textStatus, errorThrown) => {
        reject(textStatus + ': ' + errorThrown)
      }
    })
  })
}