use crate::controller;
use crate::db;
use mysql_async::prelude::*;
use warp::Filter;

#[derive(Debug)]
struct DBError;

impl warp::reject::Reject for DBError {}

pub fn prepare_routes() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone
{
    let db_pool = db::create_pool();

    let db_filter =
        warp::any()
            .map(move || db_pool.clone())
            .and_then(|pool: mysql_async::Pool| async move {
                match pool.get_conn().await {
                    Ok(conn) => Ok(conn),
                    Err(_) => Err(warp::reject::custom(DBError)),
                }
            });

    let get_home = warp::get()
        .and(warp::path::end())
        .and(db_filter)
        .and_then(|db: mysql_async::Conn| controller::home::get_home(db));

    get_home // get_home.or(next).or(next2)
}
