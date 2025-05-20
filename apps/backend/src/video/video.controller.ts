import { Controller, Get, Headers, Res } from '@nestjs/common';
import { Response } from 'express';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  streamVideo(@Headers('range') range: string, @Res() res: Response): void {
    this.videoService.getVideoStream(range, res);
  }
}
