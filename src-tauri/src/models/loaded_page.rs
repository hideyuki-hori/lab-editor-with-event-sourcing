use super::{Branch, Page, StoredEvent, StoredSnapshot};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadedPage {
    pub page: Page,
    pub branch: Branch,
    pub snapshot: Option<StoredSnapshot>,
    pub events: Vec<StoredEvent>,
}
