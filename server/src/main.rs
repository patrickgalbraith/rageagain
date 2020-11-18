use dotenv::dotenv;
use warp::Filter;

mod controller;
mod db;
mod routes;
mod views;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let get_static = warp::path("static").and(warp::fs::dir("static"));

    let routes = routes::prepare_routes().or(get_static);

    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}
