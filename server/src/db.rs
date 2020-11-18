use std::env;

pub fn create_pool() -> mysql_async::Pool {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    mysql_async::Pool::new(database_url)
}
