use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Branch {
    pub id: String,
    pub stream_id: String,
    pub name: Option<String>,
    pub parent_branch_id: Option<String>,
    pub fork_version: Option<i64>,
    pub created_at: i64,
}
