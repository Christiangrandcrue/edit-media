import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createReadStream } from 'fs';
import path from 'path';

class S3Service {
    constructor() {
        this.client = new S3Client({
            endpoint: process.env.S3_ENDPOINT || 'https://s3.twcstorage.ru',
            region: process.env.S3_REGION || 'ru-1',
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY
            },
            forcePathStyle: true // Важно для S3-совместимых хранилищ
        });

        this.bucket = process.env.S3_BUCKET || 'sz060409';
        this.basePath = process.env.S3_BASE_PATH || 'synthnova';
    }

    /**
     * Генерация S3 key для файла
     * @param {string} projectId - ID проекта
     * @param {string} assetType - Тип материала (hook/mid/cta/master/scaled)
     * @param {string} assetId - ID asset'а
     * @param {string} filename - Имя файла
     * @returns {string} - S3 key
     */
    generateKey(projectId, assetType, assetId, filename) {
        const ext = path.extname(filename);
        return `${this.basePath}/projects/${projectId}/assets/${assetType}s/${assetId}${ext}`;
    }

    /**
     * Загрузка файла в S3
     * @param {Buffer|ReadStream} fileData - Данные файла
     * @param {string} s3Key - S3 key
     * @param {string} contentType - MIME тип
     * @returns {Promise<{key: string, bucket: string, url: string}>}
     */
    async uploadFile(fileData, s3Key, contentType = 'video/mp4') {
        try {
            const upload = new Upload({
                client: this.client,
                params: {
                    Bucket: this.bucket,
                    Key: s3Key,
                    Body: fileData,
                    ContentType: contentType,
                    // ACL: 'private' // Закрытый доступ
                }
            });

            upload.on('httpUploadProgress', (progress) => {
                if (progress.loaded && progress.total) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`[S3] Upload progress: ${percent}% (${progress.loaded}/${progress.total})`);
                }
            });

            await upload.done();

            console.log(`[S3] File uploaded successfully: ${s3Key}`);

            return {
                key: s3Key,
                bucket: this.bucket,
                url: `${process.env.S3_ENDPOINT}/${this.bucket}/${s3Key}`
            };
        } catch (error) {
            console.error('[S3] Upload error DETAILS:', {
                message: error.message,
                code: error.code,
                statusCode: error.$metadata?.httpStatusCode,
                requestId: error.$metadata?.requestId,
                stack: error.stack
            });
            throw new Error(`S3 upload failed: ${error.code || error.message}`);
        }
    }

    /**
     * Загрузка файла из локальной FS в S3
     * @param {string} filePath - Путь к локальному файлу
     * @param {string} s3Key - S3 key
     * @param {string} contentType - MIME тип
     * @returns {Promise<{key: string, bucket: string, url: string}>}
     */
    async uploadFromPath(filePath, s3Key, contentType = 'video/mp4') {
        const fileStream = createReadStream(filePath);
        return this.uploadFile(fileStream, s3Key, contentType);
    }

    /**
     * Получение signed URL для доступа к файлу
     * @param {string} s3Key - S3 key
     * @param {number} expiresIn - Время жизни ссылки в секундах (по умолчанию 1 час)
     * @returns {Promise<string>} - Signed URL
     */
    async getSignedUrl(s3Key, expiresIn = 3600) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: s3Key
            });

            const url = await getSignedUrl(this.client, command, { expiresIn });
            return url;
        } catch (error) {
            console.error('[S3] Get signed URL error:', error);
            throw new Error(`Failed to generate signed URL: ${error.message}`);
        }
    }

    /**
     * Скачивание файла из S3
     * @param {string} s3Key - S3 key
     * @returns {Promise<ReadableStream>} - Stream данных файла
     */
    async downloadFile(s3Key) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: s3Key
            });

            const response = await this.client.send(command);
            return response.Body;
        } catch (error) {
            console.error('[S3] Download error:', error);
            throw new Error(`S3 download failed: ${error.message}`);
        }
    }

    /**
     * Удаление файла из S3
     * @param {string} s3Key - S3 key
     * @returns {Promise<boolean>} - true если успешно удалён
     */
    async deleteFile(s3Key) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: s3Key
            });

            await this.client.send(command);
            console.log(`[S3] File deleted successfully: ${s3Key}`);
            return true;
        } catch (error) {
            console.error('[S3] Delete error:', error);
            throw new Error(`S3 delete failed: ${error.message}`);
        }
    }

    /**
     * Проверка существования файла в S3
     * @param {string} s3Key - S3 key
     * @returns {Promise<boolean>} - true если файл существует
     */
    async fileExists(s3Key) {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucket,
                Key: s3Key
            });

            await this.client.send(command);
            return true;
        } catch (error) {
            if (error.name === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    /**
     * Получение метаданных файла
     * @param {string} s3Key - S3 key
     * @returns {Promise<{size: number, contentType: string, lastModified: Date}>}
     */
    async getFileMetadata(s3Key) {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucket,
                Key: s3Key
            });

            const response = await this.client.send(command);
            
            return {
                size: response.ContentLength,
                contentType: response.ContentType,
                lastModified: response.LastModified
            };
        } catch (error) {
            console.error('[S3] Get metadata error:', error);
            throw new Error(`Failed to get file metadata: ${error.message}`);
        }
    }
}

// Singleton экземпляр
const s3Service = new S3Service();

export default s3Service;
