import { spawn } from 'node:child_process';
import { mkdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import type { AudioSource } from './adapters/types.js';

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

  async ensureDownloaded(showId: string, episodeId: string, audio: AudioSource): Promise<string> {
    const filePath = this.pathFor(showId, episodeId);
    if (await fileExists(filePath)) {
      return filePath;
    }
    const existing = this.inFlight.get(filePath);
    if (existing) {
      return existing;
    }
    const promise = this.download(audio, filePath).finally(() => {
      this.inFlight.delete(filePath);
    });
    this.inFlight.set(filePath, promise);
    return promise;
  }

  pathFor(showId: string, episodeId: string): string {
    return path.join(this.storageDir, showId, `${episodeId}.mp3`);
  }

  private async download(audio: AudioSource, filePath: string): Promise<string> {
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
      audio.url,
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
