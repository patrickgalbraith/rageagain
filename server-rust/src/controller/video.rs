use crate::routes::ResolveVideoRequest;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct VideoInfo {
    video_ids: Vec<String>,
}

pub async fn get_video(req: ResolveVideoRequest) -> Result<impl warp::Reply, warp::Rejection> {}
