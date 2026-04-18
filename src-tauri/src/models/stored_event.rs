use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct StoredEvent {
    pub sequence_id: i64,
    pub stream_id: String,
    pub branch_id: String,
    pub kind: String,
    pub payload: String,
    pub version: i64,
    pub created_at: i64,
}
