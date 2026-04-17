use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StoredSnapshot {
    pub branch_id: String,
    pub version: i64,
    pub state: String,
    pub created_at: i64,
}
