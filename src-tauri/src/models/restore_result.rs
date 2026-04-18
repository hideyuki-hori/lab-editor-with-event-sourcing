use super::{StoredEvent, StoredSnapshot};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RestoreResult {
    pub branch_id: String,
    pub target_version: i64,
    pub snapshot: Option<StoredSnapshot>,
    pub events: Vec<StoredEvent>,
}
