import { Injectable, Logger } from '@nestjs/common';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  getVideoStream(range: string | undefined, res: Response): void {
    const videoPath = process.env.VIDEO_FILE_PATH || 'src/assets/sample.mp4';
    const videoFilePath = join(process.cwd(), videoPath);

    try {
      const { size } = statSync(videoFilePath);

      if (range) {
        this.logger.debug(`Streaming video with range: ${range}`);
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
        const chunkSize = end - start + 1;

        res.status(206);
        res.header({
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
        });

        const stream = createReadStream(videoFilePath, { start, end });
        stream.pipe(res);
      } else {
        this.logger.debug('Streaming entire video');
        res.header({
          'Content-Length': size,
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
        });

        const stream = createReadStream(videoFilePath);
        stream.pipe(res);
      }
    } catch (error) {
      this.logger.error('Failed to stream video:', error);
      res.status(500).json({ message: 'Gagal memuat video' });
    }
  }
}
