use crate::db;
use crate::views;
use warp::Filter;

#[derive(Debug)]
struct DBError;

impl warp::reject::Reject for DBError {}

pub fn prepare_routes() -> warp::filters::BoxedFilter<(views::IndexTemplate<'static>,)> {
    // let db_pool = db::create_pool();

    // let db_filter =
    //     warp::any()
    //         .map(move || db_pool.clone())
    //         .and_then(|pool: db::DBPool| async move {
    //             match pool.get_conn().await {
    //                 Ok(conn) => Ok(conn),
    //                 Err(_) => Err(warp::reject::custom(DBError)),
    //             }
    //         });

    let get_home = warp::get()
        .and(warp::path::end())
        //.and(db_filter)
        //.map(|db: db::DBCon| views::IndexTemplate {
        .map(|| views::IndexTemplate {
            est_play_time: "1d, 12h",
            playlist_count: &100,
            track_count: &200,
            playlists: Vec::new(),
            specials: Vec::new(),
        })
        .boxed();

    get_home // get_home.or(next).or(next2)
}
