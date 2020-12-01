use crate::controller;
use serde::{Deserialize, Serialize};
use warp::Filter;

#[derive(Serialize, Deserialize, Debug)]
pub struct ResolveVideoRequest {
    artist: String,
    song: String,
}

pub fn prepare_routes() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone
{
    let get_resolve_video = warp::get()
        .and(warp::path("resolve_video"))
        .and(warp::query::<ResolveVideoRequest>())
        .and_then(|p: ResolveVideoRequest| controller::video::get_video(p));

    get_resolve_video // get_resolve_video.or(next).or(next2)
}
