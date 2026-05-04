import { spawn } from 'node:child_process';
import { mkdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';

interface AudioCacheOptions {
  storageDir: string;
  ytDlpPath?: string;
}

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

export class AudioCache {
  private readonly storageDir: string;
  private readonly ytDlpPath: string;
  private readonly inFlight = new Map<string, Promise<string>>();

  constructor({ storageDir, ytDlpPath = 'yt-dlp' }: AudioCacheOptions) {
    this.storageDir = storageDir;
    this.ytDlpPath = ytDlpPath;
  }

  async ensureDownloaded(showId: string, episodeId: string, audioUrls: string[]): Promise<string> {
    const filePath = this.pathFor(showId, episodeId);
    if (await fileExists(filePath)) {
      return filePath;
    }
    const existing = this.inFlight.get(filePath);
    if (existing) {
      return existing;
    }
    const promise = this.downloadFromAny(audioUrls, filePath).finally(() => {
      this.inFlight.delete(filePath);
    });
    this.inFlight.set(filePath, promise);
    return promise;
  }

  pathFor(showId: string, episodeId: string): string {
    return path.join(this.storageDir, showId, `${episodeId}.mp3`);
  }

  private async downloadFromAny(urls: string[], filePath: string): Promise<string> {
    if (urls.length === 0) {
      throw new Error('No audio sources available');
    }
    const errors: string[] = [];
    for (const url of urls) {
      try {
        return await this.download(url, filePath);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[audio] ${url} failed: ${message}`);
        errors.push(`${url}: ${message}`);
      }
    }
    throw new Error(`All audio sources failed:\n${errors.join('\n')}`);
  }

  private async download(url: string, filePath: string): Promise<string> {
    await mkdir(path.dirname(filePath), { recursive: true });
    const tmpBase = `${filePath}.part`;
    const tmpFile = `${tmpBase}.mp3`;
    await rm(tmpFile, { force: true });

    const args = [
      '--no-playlist',
      '--no-progress',
      '--extract-audio',
      '--audio-format',
      'mp3',
      '--audio-quality',
      '0',
      '-o',
      `${tmpBase}.%(ext)s`,
      url,
    ];

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(this.ytDlpPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stderr = '';
      proc.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      proc.on('error', reject);
      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`yt-dlp exited with code ${code}: ${stderr.trim()}`));
        }
      });
    });

    if (!(await fileExists(tmpFile))) {
      throw new Error(`yt-dlp finished but output file ${tmpFile} is missing`);
    }
    await rename(tmpFile, filePath);
    return filePath;
  }
}
