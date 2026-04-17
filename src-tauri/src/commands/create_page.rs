use super::common::{emit_pages_changed, now_ms};
use crate::db::DbPool;
use crate::models::Page;
use tauri::{AppHandle, State};
use uuid::Uuid;

#[tauri::command]
pub async fn create_page(
    app: AppHandle,
    pool: State<'_, DbPool>,
    title: Option<String>,
) -> Result<Page, String> {
    let page_id = Uuid::new_v4().to_string();
    let branch_id = Uuid::new_v4().to_string();
    let now = now_ms();
    let title = title.unwrap_or_default();

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO branches (id, stream_id, name, parent_branch_id, fork_version, created_at) VALUES (?, ?, 'main', NULL, NULL, ?)",
    )
    .bind(&branch_id)
    .bind(&page_id)
    .bind(now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO pages (id, title, active_branch_id, updated_at) VALUES (?, ?, ?, ?)",
    )
    .bind(&page_id)
    .bind(&title)
    .bind(&branch_id)
    .bind(now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    emit_pages_changed(&app)?;

    Ok(Page {
        id: page_id,
        title,
        active_branch_id: branch_id,
        updated_at: now,
    })
}
