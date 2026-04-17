use super::common::fetch_branch;
use crate::db::DbPool;
use crate::models::{LoadedPage, Page, StoredEvent, StoredSnapshot};
use tauri::State;

#[tauri::command]
pub async fn load_page(pool: State<'_, DbPool>, id: String) -> Result<LoadedPage, String> {
    let page = sqlx::query_as::<_, Page>(
        "SELECT id, title, active_branch_id, updated_at FROM pages WHERE id = ?",
    )
    .bind(&id)
    .fetch_one(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    let branch = fetch_branch(&*pool, &page.active_branch_id).await?;

    let snapshot = sqlx::query_as::<_, StoredSnapshot>(
        "SELECT branch_id, version, state, created_at FROM snapshots WHERE branch_id = ? ORDER BY version DESC LIMIT 1",
    )
    .bind(&branch.id)
    .fetch_optional(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    let from_version = snapshot.as_ref().map(|s| s.version).unwrap_or(0);
    let events = sqlx::query_as::<_, StoredEvent>(
        "SELECT sequence_id, stream_id, branch_id, kind, payload, version, created_at FROM events WHERE branch_id = ? AND version > ? ORDER BY version ASC",
    )
    .bind(&branch.id)
    .bind(from_version)
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(LoadedPage {
        page,
        branch,
        snapshot,
        events,
    })
}
