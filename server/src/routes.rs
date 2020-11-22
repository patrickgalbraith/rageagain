use crate::controller;
use warp::Filter;

pub fn prepare_routes() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone
{
    let get_home = warp::get()
        .and(warp::path::end())
        .and_then(|| controller::video::get_video());

    get_home // get_home.or(next).or(next2)
}
