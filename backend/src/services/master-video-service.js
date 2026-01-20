// master-video-service.js - Service для работы с мастер-роликами
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || '/data/db/synthnova.sqlite';
const PROJECTS_DIR = process.env.PROJECTS_DIR || '/data/projects';

const db = new Database(DB_PATH);

/**
 * Создать мастер-ролик
 */
export async function createMasterVideo({ 
  project_id, 
  name, 
  shots_config,  // { hook_ids: [], mid_ids: [], cta_ids: [] }
  metadata = {} 
}) {
  const master_id = `master_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const created_at = new Date().toISOString();
  
  // Создать запись в БД
  const stmt = db.prepare(`
    INSERT INTO master_videos (
      master_id, project_id, name, status, 
      shots_config, sync_markers, metadata, created_at, updated_at
    )
    VALUES (?, ?, ?, 'created', ?, '[]', ?, ?, ?)
  `);
  
  stmt.run(
    master_id,
    project_id,
    name,
    JSON.stringify(shots_config),
    JSON.stringify(metadata),
    created_at,
    created_at
  );
  
  console.log(`[MasterVideoService] Created master video: ${master_id} (${name})`);
  
  return getMasterVideo(master_id);
}

/**
 * Получить мастер-ролик по ID
 */
export function getMasterVideo(master_id) {
  const master = db.prepare('SELECT * FROM master_videos WHERE master_id = ?').get(master_id);
  
  if (master) {
    try {
      master.shots_config = JSON.parse(master.shots_config || '{}');
      master.sync_markers = JSON.parse(master.sync_markers || '[]');
      master.metadata = JSON.parse(master.metadata || '{}');
    } catch (e) {
      console.error('[MasterVideoService] Error parsing JSON fields:', e);
    }
  }
  
  return master;
}

/**
 * Получить все мастер-ролики проекта
 */
export function getProjectMasterVideos(project_id) {
  const masters = db.prepare('SELECT * FROM master_videos WHERE project_id = ? ORDER BY created_at DESC').all(project_id);
  
  return masters.map(m => {
    try {
      m.shots_config = JSON.parse(m.shots_config || '{}');
      m.sync_markers = JSON.parse(m.sync_markers || '[]');
      m.metadata = JSON.parse(m.metadata || '{}');
    } catch (e) {
      console.error('[MasterVideoService] Error parsing JSON fields:', e);
    }
    return m;
  });
}

/**
 * Обновить статус мастер-ролика
 */
export function updateMasterVideoStatus(master_id, status) {
  const stmt = db.prepare(`
    UPDATE master_videos 
    SET status = ?, updated_at = ? 
    WHERE master_id = ?
  `);
  
  stmt.run(status, new Date().toISOString(), master_id);
  
  console.log(`[MasterVideoService] Updated status for ${master_id}: ${status}`);
  
  return getMasterVideo(master_id);
}

/**
 * Обновить путь к файлу мастер-ролика
 */
export function updateMasterVideoPath(master_id, file_path, video_path = null, audio_path = null) {
  const updates = ['file_path = ?', 'updated_at = ?'];
  const values = [file_path, new Date().toISOString()];
  
  if (video_path) {
    updates.push('video_path = ?');
    values.push(video_path);
  }
  
  if (audio_path) {
    updates.push('audio_path = ?');
    values.push(audio_path);
  }
  
  values.push(master_id);
  
  const stmt = db.prepare(`UPDATE master_videos SET ${updates.join(', ')} WHERE master_id = ?`);
  stmt.run(...values);
  
  console.log(`[MasterVideoService] Updated paths for ${master_id}`);
  
  return getMasterVideo(master_id);
}

/**
 * Сохранить маркеры синхронизации
 */
export function saveSyncMarkers(master_id, markers) {
  const stmt = db.prepare('UPDATE master_videos SET sync_markers = ?, updated_at = ? WHERE master_id = ?');
  stmt.run(JSON.stringify(markers), new Date().toISOString(), master_id);
  
  console.log(`[MasterVideoService] Saved ${markers.length} sync markers for ${master_id}`);
  
  return getMasterVideo(master_id);
}

/**
 * Одобрить мастер-ролик
 */
export function approveMasterVideo(master_id) {
  const stmt = db.prepare('UPDATE master_videos SET approved = 1, updated_at = ? WHERE master_id = ?');
  stmt.run(new Date().toISOString(), master_id);
  
  console.log(`[MasterVideoService] Approved master video: ${master_id}`);
  
  return getMasterVideo(master_id);
}

/**
 * Удалить мастер-ролик
 */
export function deleteMasterVideo(master_id) {
  const master = getMasterVideo(master_id);
  
  if (!master) {
    return { success: false, error: 'Master video not found' };
  }
  
  // Удалить файлы
  if (master.file_path && fs.existsSync(master.file_path)) {
    fs.unlinkSync(master.file_path);
  }
  if (master.video_path && fs.existsSync(master.video_path)) {
    fs.unlinkSync(master.video_path);
  }
  if (master.audio_path && fs.existsSync(master.audio_path)) {
    fs.unlinkSync(master.audio_path);
  }
  
  // Удалить из БД
  db.prepare('DELETE FROM master_videos WHERE master_id = ?').run(master_id);
  
  console.log(`[MasterVideoService] Deleted master video: ${master_id}`);
  
  return { success: true };
}

export default {
  createMasterVideo,
  getMasterVideo,
  getProjectMasterVideos,
  updateMasterVideoStatus,
  updateMasterVideoPath,
  saveSyncMarkers,
  approveMasterVideo,
  deleteMasterVideo
};
