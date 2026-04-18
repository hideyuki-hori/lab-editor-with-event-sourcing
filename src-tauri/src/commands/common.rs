use crate::models::Branch;
use serde::Serialize;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter};

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub(super) struct StepsAppliedPayload {
    pub stream_id: String,
    pub branch_id: String,
    pub version: i64,
}

pub(super) fn emit_pages_changed(app: &AppHandle) -> Result<(), String> {
    app.emit("pages_changed", ()).map_err(|e| e.to_string())
}

pub(super) fn emit_steps_applied(
    app: &AppHandle,
    payload: StepsAppliedPayload,
) -> Result<(), String> {
    app.emit("steps_applied", payload).map_err(|e| e.to_string())
}

pub(super) fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

pub(super) async fn fetch_branch(
    executor: impl sqlx::Executor<'_, Database = sqlx::Sqlite>,
    branch_id: &str,
) -> Result<Branch, String> {
    sqlx::query_as::<_, Branch>(
        "SELECT id, stream_id, name, parent_branch_id, fork_version, created_at FROM branches WHERE id = ?",
    )
    .bind(branch_id)
    .fetch_one(executor)
    .await
    .map_err(|e| e.to_string())
}
