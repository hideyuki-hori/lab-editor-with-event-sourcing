use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventInput {
    pub kind: String,
    pub payload: String,
}
