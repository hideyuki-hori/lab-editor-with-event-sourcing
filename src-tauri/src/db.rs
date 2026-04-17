use sqlx::sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions};
use std::path::Path;
use std::str::FromStr;

pub type DbPool = SqlitePool;

pub async fn init(db_path: &Path) -> Result<DbPool, sqlx::Error> {
    let url = format!("sqlite://{}", db_path.display());
    let options = SqliteConnectOptions::from_str(&url)?.create_if_missing(true);
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;
    sqlx::migrate!("./migrations").run(&pool).await?;
    Ok(pool)
}
