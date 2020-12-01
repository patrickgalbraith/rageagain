
pub enum MusicVideoProvider {
    imvdb,
    ytscraper
}

pub enum MusicVideoHost {
    youtube
}

#[derive(Debug, serde_derive::Serialize, serde_derive::Deserialize)]
struct MusicVideoInfo {
    pub provider: MusicVideoProvider,
    pub source: MusicVideoHost
}

#[derive(Default, Debug, Clone, PartialEq, serde_derive::Serialize, serde_derive::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImvdbResponse {
    #[serde(rename = "total_results")]
    pub total_results: i64,
    #[serde(rename = "current_page")]
    pub current_page: i64,
    #[serde(rename = "per_page")]
    pub per_page: i64,
    #[serde(rename = "total_pages")]
    pub total_pages: i64,
    pub results: Vec<ImvdbResult>,
}

#[derive(Default, Debug, Clone, PartialEq, serde_derive::Serialize, serde_derive::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImvdbResult {
    pub id: i64,
    #[serde(rename = "production_status")]
    pub production_status: String,
    #[serde(rename = "song_title")]
    pub song_title: String,
    #[serde(rename = "song_slug")]
    pub song_slug: String,
    pub url: String,
    #[serde(rename = "multiple_versions")]
    pub multiple_versions: bool,
    #[serde(rename = "version_name")]
    pub version_name: ::serde_json::Value,
    #[serde(rename = "version_number")]
    pub version_number: i64,
    #[serde(rename = "is_imvdb_pick")]
    pub is_imvdb_pick: bool,
    #[serde(rename = "aspect_ratio")]
    pub aspect_ratio: ::serde_json::Value,
    pub year: i64,
    #[serde(rename = "verified_credits")]
    pub verified_credits: bool,
    pub artists: Vec<ImvdbArtist>,
    pub image: ImvdbImage,
}

#[derive(Default, Debug, Clone, PartialEq, serde_derive::Serialize, serde_derive::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImvdbArtist {
    pub name: String,
    pub slug: String,
    pub url: String,
}

#[derive(Default, Debug, Clone, PartialEq, serde_derive::Serialize, serde_derive::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImvdbImage {
    pub o: String,
    pub l: String,
    pub b: String,
    pub t: String,
    pub s: String,
}

async fn search_for_music_video() ->  { 5 }

async fn search_via_imvdb() -> {

}

#[derive(Default, Debug, Clone, PartialEq, serde_derive::Serialize, serde_derive::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct YoutubeScrape {
    pub results: Vec<YoutubeScrapeResult>,
    pub version: String,
    pub parser: String,
    pub key: String,
    pub estimated_results: String,
    pub next_page_token: String,
}

#[derive(Default, Debug, Clone, PartialEq, serde_derive::Serialize, serde_derive::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct YoutubeScrapeResult {
    pub video: Option<YoutubeScrapeVideo>,
    pub uploader: YoutubeScrapeUploader,
    pub radio: Option<YoutubeScrapeRadio>,
}

#[derive(Default, Debug, Clone, PartialEq, serde_derive::Serialize, serde_derive::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct YoutubeScrapeVideo {
    pub id: String,
    pub title: String,
    pub url: String,
    pub duration: String,
    pub snippet: String,
    #[serde(rename = "upload_date")]
    pub upload_date: String,
    #[serde(rename = "thumbnail_src")]
    pub thumbnail_src: String,
    pub views: String,
}

#[derive(Default, Debug, Clone, PartialEq, serde_derive::Serialize, serde_derive::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct YoutubeScrapeUploader {
    pub username: String,
    pub url: Option<String>,
    pub verified: Option<bool>,
}

#[derive(Default, Debug, Clone, PartialEq, serde_derive::Serialize, serde_derive::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct YoutubeScrapeRadio {
    pub id: String,
    pub title: String,
    pub url: String,
    #[serde(rename = "thumbnail_src")]
    pub thumbnail_src: String,
    #[serde(rename = "video_count")]
    pub video_count: String,
}


async fn search_via_youtube_scrape() -> {

}