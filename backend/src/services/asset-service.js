// asset-service.js - Service для работы с материалами проекта (S3 version)
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import s3Service from './s3-service.js';

const DB_PATH = process.env.DB_PATH || '/data/db/synthnova.sqlite';
const USE_S3 = process.env.USE_S3 === 'true' || true; // По умолчанию используем S3

const db = new Database(DB_PATH);

/**
 * Добавить материал в проект (с загрузкой в S3)
 */
export async function addAsset({ project_id, asset_type, file_path, original_filename, file_buffer, metadata = {} }) {
  const asset_id = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const created_at = new Date().toISOString();
  
  let finalFilePath;
  let s3_key = null;
  let s3_bucket = null;
  let file_size;

  if (USE_S3) {
    // Загрузка в S3
    console.log(`[Asset] Uploading to S3: ${original_filename}`);
    
    // Генерируем S3 key
    s3_key = s3Service.generateKey(project_id, asset_type, asset_id, original_filename);
    s3_bucket = s3Service.bucket;
    
    // Загружаем файл
    let uploadResult;
    if (file_buffer) {
      // Если передан Buffer
      uploadResult = await s3Service.uploadFile(file_buffer, s3_key);
    } else if (file_path) {
      // Если передан путь к файлу
      uploadResult = await s3Service.uploadFromPath(file_path, s3_key);
    } else {
      throw new Error('No file data provided');
    }
    
    finalFilePath = uploadResult.url;
    
    // Получаем размер из метаданных S3
    const fileMetadata = await s3Service.getFileMetadata(s3_key);
    file_size = fileMetadata.size;
    
    console.log(`[Asset] Successfully uploaded to S3: ${s3_key}`);
  } else {
    // Локальное хранение (fallback)
    const projectDir = path.join(PROJECTS_DIR, project_id, 'assets');
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    
    const ext = path.extname(original_filename);
    const newFilename = `${asset_id}${ext}`;
    const targetPath = path.join(projectDir, newFilename);
    
    if (file_buffer) {
      fs.writeFileSync(targetPath, file_buffer);
    } else if (file_path) {
      fs.copyFileSync(file_path, targetPath);
    }
    
    const stats = fs.statSync(targetPath);
    file_size = stats.size;
    finalFilePath = targetPath;
  }
  
  // Сохранить в БД
  const stmt = db.prepare(`
    INSERT INTO project_assets (
      asset_id, project_id, asset_type, file_path, 
      original_filename, file_size, metadata, 
      s3_key, s3_bucket, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    asset_id,
    project_id,
    asset_type,
    finalFilePath,
    original_filename,
    file_size,
    JSON.stringify(metadata),
    s3_key,
    s3_bucket,
    created_at
  );
  
  return {
    asset_id,
    project_id,
    asset_type,
    file_path: finalFilePath,
    original_filename,
    file_size,
    metadata,
    s3_key,
    s3_bucket,
    created_at
  };
}

/**
 * Получить все материалы проекта
 */
export function getProjectAssets(project_id) {
  const stmt = db.prepare(`
    SELECT * FROM project_assets
    WHERE project_id = ?
    ORDER BY created_at DESC
  `);
  
  const assets = stmt.all(project_id);
  
  // Парсим metadata для каждого asset'а
  return assets.map(asset => ({
    ...asset,
    metadata: asset.metadata ? JSON.parse(asset.metadata) : {}
  }));
}

/**
 * Получить один материал по ID
 */
export function getAssetById(asset_id) {
  const stmt = db.prepare(`
    SELECT * FROM project_assets
    WHERE asset_id = ?
  `);
  
  const asset = stmt.get(asset_id);
  
  if (asset && asset.metadata) {
    asset.metadata = JSON.parse(asset.metadata);
  }
  
  return asset;
}

/**
 * Получить signed URL для доступа к файлу в S3
 */
export async function getAssetSignedUrl(asset_id, expiresIn = 3600) {
  const asset = getAssetById(asset_id);
  
  if (!asset) {
    throw new Error('Asset not found');
  }
  
  if (asset.s3_key && USE_S3) {
    // Генерируем signed URL для S3
    return await s3Service.getSignedUrl(asset.s3_key, expiresIn);
  } else {
    // Для локальных файлов возвращаем обычный путь
    return asset.file_path;
  }
}

/**
 * Скачать файл материала
 */
export async function downloadAsset(asset_id) {
  const asset = getAssetById(asset_id);
  
  if (!asset) {
    throw new Error('Asset not found');
  }
  
  if (asset.s3_key && USE_S3) {
    // Скачиваем из S3
    const stream = await s3Service.downloadFile(asset.s3_key);
    return {
      stream,
      filename: asset.original_filename,
      contentType: 'video/mp4'
    };
  } else {
    // Читаем локальный файл
    const stream = fs.createReadStream(asset.file_path);
    return {
      stream,
      filename: asset.original_filename,
      contentType: 'video/mp4'
    };
  }
}

/**
 * Удалить материал
 */
export async function deleteAsset(asset_id) {
  const asset = getAssetById(asset_id);
  
  if (!asset) {
    throw new Error('Asset not found');
  }
  
  // Удаляем файл
  if (asset.s3_key && USE_S3) {
    await s3Service.deleteFile(asset.s3_key);
    console.log(`[Asset] Deleted from S3: ${asset.s3_key}`);
  } else if (asset.file_path && fs.existsSync(asset.file_path)) {
    fs.unlinkSync(asset.file_path);
    console.log(`[Asset] Deleted local file: ${asset.file_path}`);
  }
  
  // Удаляем запись из БД
  const stmt = db.prepare(`
    DELETE FROM project_assets
    WHERE asset_id = ?
  `);
  
  stmt.run(asset_id);
  
  return { success: true, asset_id };
}

/**
 * Обновить метаданные материала
 */
export function updateAssetMetadata(asset_id, metadata) {
  const stmt = db.prepare(`
    UPDATE project_assets
    SET metadata = ?
    WHERE asset_id = ?
  `);
  
  stmt.run(JSON.stringify(metadata), asset_id);
  
  return getAssetById(asset_id);
}

/**
 * Получить статистику по материалам проекта
 */
export function getProjectAssetsStats(project_id) {
  const stmt = db.prepare(`
    SELECT 
      asset_type,
      COUNT(*) as count,
      SUM(file_size) as total_size
    FROM project_assets
    WHERE project_id = ?
    GROUP BY asset_type
  `);
  
  const stats = stmt.all(project_id);
  
  return {
    hooks: stats.find(s => s.asset_type === 'hook')?.count || 0,
    mids: stats.find(s => s.asset_type === 'mid')?.count || 0,
    ctas: stats.find(s => s.asset_type === 'cta')?.count || 0,
    total_size: stats.reduce((sum, s) => sum + (s.total_size || 0), 0)
  };
}

export default {
  addAsset,
  getProjectAssets,
  getAssetById,
  getAssetSignedUrl,
  downloadAsset,
  deleteAsset,
  updateAssetMetadata,
  getProjectAssetsStats
};
