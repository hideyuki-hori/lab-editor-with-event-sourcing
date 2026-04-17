use crate::db::DbPool;
use crate::models::Branch;
use tauri::State;

#[tauri::command]
pub async fn list_branches(
    pool: State<'_, DbPool>,
    stream_id: String,
) -> Result<Vec<Branch>, String> {
    sqlx::query_as::<_, Branch>(
        "SELECT id, stream_id, name, parent_branch_id, fork_version, created_at FROM branches WHERE stream_id = ? ORDER BY created_at ASC",
    )
    .bind(&stream_id)
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())
}
