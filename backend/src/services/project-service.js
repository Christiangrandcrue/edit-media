// project-service.js - Service для работы с проектами
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const JOBS_DIR = process.env.JOBS_DIR || '/data/jobs';
const DB_PATH = process.env.DB_PATH || '/data/db/synthnova.sqlite';
const PROJECTS_DIR = process.env.PROJECTS_DIR || '/data/projects';

const db = new Database(DB_PATH);

/**
 * Создать новый проект
 */
export async function createProject({ name, description }) {
  const project_id = `project_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const created_at = new Date().toISOString();
  
  // Создать запись в БД
  const stmt = db.prepare(`
    INSERT INTO projects (project_id, name, description, status, created_at, updated_at)
    VALUES (?, ?, ?, 'active', ?, ?)
  `);
  
  stmt.run(project_id, name, description || '', created_at, created_at);
  
  // Создать директорию проекта
  const projectDir = path.join(PROJECTS_DIR, project_id);
  fs.mkdirSync(path.join(projectDir, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'masters'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'scaled'), { recursive: true });
  
  console.log(`[ProjectService] Created project: ${project_id} (${name})`);
  
  return getProject(project_id);
}

/**
 * Получить проект по ID
 */
export function getProject(project_id) {
  const project = db.prepare('SELECT * FROM projects WHERE project_id = ?').get(project_id);
  
  if (!project) {
    return null;
  }
  
  // Подгрузить статистику
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_assets,
      SUM(CASE WHEN asset_type = 'hook' THEN 1 ELSE 0 END) as hooks,
      SUM(CASE WHEN asset_type = 'mid' THEN 1 ELSE 0 END) as mids,
      SUM(CASE WHEN asset_type = 'cta' THEN 1 ELSE 0 END) as ctas,
      SUM(CASE WHEN asset_type = 'target_video' THEN 1 ELSE 0 END) as target_videos
    FROM project_assets
    WHERE project_id = ?
  `).get(project_id);
  
  const masterVideos = db.prepare(`
    SELECT COUNT(*) as count FROM master_videos WHERE project_id = ?
  `).get(project_id);
  
  const scaledVideos = db.prepare(`
    SELECT COUNT(*) as count FROM scaled_videos WHERE project_id = ?
  `).get(project_id);
  
  return {
    ...project,
    stats: {
      assets: stats?.total_assets || 0,
      hooks: stats?.hooks || 0,
      mids: stats?.mids || 0,
      ctas: stats?.ctas || 0,
      target_videos: stats?.target_videos || 0,
      master_videos: masterVideos?.count || 0,
      scaled_videos: scaledVideos?.count || 0
    }
  };
}

/**
 * Получить все проекты
 */
export function getAllProjects() {
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  
  return projects.map(p => getProject(p.project_id));
}

/**
 * Обновить проект
 */
export function updateProject(project_id, updates) {
  const fields = [];
  const values = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  
  values.push(project_id);
  
  const stmt = db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE project_id = ?`);
  stmt.run(...values);
  
  console.log(`[ProjectService] Updated project: ${project_id}`);
  
  return getProject(project_id);
}

/**
 * Удалить проект
 */
export function deleteProject(project_id) {
  // Удалить из БД
  db.prepare('DELETE FROM scaled_videos WHERE project_id = ?').run(project_id);
  db.prepare('DELETE FROM master_videos WHERE project_id = ?').run(project_id);
  db.prepare('DELETE FROM project_assets WHERE project_id = ?').run(project_id);
  db.prepare('DELETE FROM projects WHERE project_id = ?').run(project_id);
  
  // Удалить директорию
  const projectDir = path.join(PROJECTS_DIR, project_id);
  if (fs.existsSync(projectDir)) {
    fs.rmSync(projectDir, { recursive: true, force: true });
  }
  
  console.log(`[ProjectService] Deleted project: ${project_id}`);
  
  return { success: true };
}

export default {
  createProject,
  getProject,
  getAllProjects,
  updateProject,
  deleteProject
};
