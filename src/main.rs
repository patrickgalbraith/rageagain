use askama::Template;
use warp::Filter;

#[derive(Template)]
#[template(path = "hello.html")]
struct HelloTemplate<'a> {
    name: &'a str,
}

#[tokio::main]
async fn main() {
    // GET /hello/warp => 200 OK with body "Hello, warp!"
    let hello = warp::get()
        .and(warp::path::end())
        .map(|| HelloTemplate { name: "world2" });

    warp::serve(hello).run(([127, 0, 0, 1], 3030)).await;
}
