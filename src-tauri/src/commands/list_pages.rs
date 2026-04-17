use crate::db::DbPool;
use crate::models::Page;
use tauri::State;

#[tauri::command]
pub async fn list_pages(pool: State<'_, DbPool>) -> Result<Vec<Page>, String> {
    sqlx::query_as::<_, Page>(
        "SELECT id, title, active_branch_id, updated_at FROM pages ORDER BY updated_at DESC",
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())
}
