use super::common::{emit_pages_changed, now_ms};
use crate::db::DbPool;
use crate::models::{Branch, StoredSnapshot};
use tauri::{AppHandle, State};
use uuid::Uuid;

#[tauri::command]
pub async fn create_branch(
    app: AppHandle,
    pool: State<'_, DbPool>,
    stream_id: String,
    parent_branch_id: String,
    fork_version: i64,
    name: Option<String>,
) -> Result<Branch, String> {
    let branch_id = Uuid::new_v4().to_string();
    let now = now_ms();

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO branches (id, stream_id, name, parent_branch_id, fork_version, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(&branch_id)
    .bind(&stream_id)
    .bind(&name)
    .bind(&parent_branch_id)
    .bind(fork_version)
    .bind(now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    let parent_snapshot = sqlx::query_as::<_, StoredSnapshot>(
        "SELECT branch_id, version, state, created_at FROM snapshots WHERE branch_id = ? AND version <= ? ORDER BY version DESC LIMIT 1",
    )
    .bind(&parent_branch_id)
    .bind(fork_version)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    if let Some(snap) = parent_snapshot {
        sqlx::query(
            "INSERT INTO snapshots (branch_id, version, state, created_at) VALUES (?, ?, ?, ?)",
        )
        .bind(&branch_id)
        .bind(snap.version)
        .bind(&snap.state)
        .bind(now)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    sqlx::query("UPDATE pages SET active_branch_id = ?, updated_at = ? WHERE id = ?")
        .bind(&branch_id)
        .bind(now)
        .bind(&stream_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    emit_pages_changed(&app)?;

    Ok(Branch {
        id: branch_id,
        stream_id,
        name,
        parent_branch_id: Some(parent_branch_id),
        fork_version: Some(fork_version),
        created_at: now,
    })
}
