use super::common::now_ms;
use crate::db::DbPool;
use tauri::State;

#[tauri::command]
pub async fn save_snapshot(
    pool: State<'_, DbPool>,
    branch_id: String,
    version: i64,
    state: String,
) -> Result<(), String> {
    let now = now_ms();
    sqlx::query(
        "INSERT OR REPLACE INTO snapshots (branch_id, version, state, created_at) VALUES (?, ?, ?, ?)",
    )
    .bind(&branch_id)
    .bind(version)
    .bind(&state)
    .bind(now)
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}
