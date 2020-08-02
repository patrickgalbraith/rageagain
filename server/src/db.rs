use dotenv::dotenv;
use std::env;

pub type DBPool = mysql_async::Pool;
pub type DBCon = mysql_async::Conn;

pub fn create_pool() -> DBPool {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    mysql_async::Pool::new(database_url)
}
