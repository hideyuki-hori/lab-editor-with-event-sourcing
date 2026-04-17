use super::common::{StepsAppliedPayload, emit_pages_changed, emit_steps_applied, now_ms};
use crate::db::DbPool;
use crate::models::EventInput;
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn append_events(
    app: AppHandle,
    pool: State<'_, DbPool>,
    page_id: String,
    branch_id: String,
    expected_version: i64,
    events: Vec<EventInput>,
    title: Option<String>,
) -> Result<i64, String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let current: (i64,) =
        sqlx::query_as("SELECT COALESCE(MAX(version), 0) FROM events WHERE branch_id = ?")
            .bind(&branch_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

    if current.0 != expected_version {
        return Err(format!(
            "version conflict: expected {}, stored {}",
            expected_version, current.0
        ));
    }

    let now = now_ms();
    let mut version = expected_version;
    for event in events {
        version += 1;
        sqlx::query(
            "INSERT INTO events (stream_id, branch_id, kind, payload, version, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(&page_id)
        .bind(&branch_id)
        .bind(&event.kind)
        .bind(&event.payload)
        .bind(version)
        .bind(now)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    match title {
        Some(t) => {
            sqlx::query("UPDATE pages SET title = ?, updated_at = ? WHERE id = ?")
                .bind(&t)
                .bind(now)
                .bind(&page_id)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;
        }
        None => {
            sqlx::query("UPDATE pages SET updated_at = ? WHERE id = ?")
                .bind(now)
                .bind(&page_id)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;
        }
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    emit_steps_applied(
        &app,
        StepsAppliedPayload {
            stream_id: page_id.clone(),
            branch_id: branch_id.clone(),
            version,
        },
    )?;
    emit_pages_changed(&app)?;

    Ok(version)
}
