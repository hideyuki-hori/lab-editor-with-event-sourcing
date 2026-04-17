use super::common::{emit_pages_changed, now_ms};
use super::load_page::load_page;
use crate::db::DbPool;
use crate::models::LoadedPage;
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn switch_branch(
    app: AppHandle,
    pool: State<'_, DbPool>,
    stream_id: String,
    branch_id: String,
) -> Result<LoadedPage, String> {
    let now = now_ms();
    sqlx::query("UPDATE pages SET active_branch_id = ?, updated_at = ? WHERE id = ?")
        .bind(&branch_id)
        .bind(now)
        .bind(&stream_id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    emit_pages_changed(&app)?;

    load_page(pool, stream_id).await
}
