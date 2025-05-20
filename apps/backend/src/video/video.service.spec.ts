import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { Response } from 'express';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';

jest.mock('fs', () => ({
  createReadStream: jest.fn(),
  statSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn(),
}));

describe('VideoService', () => {
  let service: VideoService;
  let mockResponse: Partial<Response>;
  let mockStream: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoService],
    }).compile();

    service = module.get<VideoService>(VideoService);

    mockStream = {
      pipe: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    (createReadStream as jest.Mock).mockReturnValue(mockStream);
    (join as jest.Mock).mockReturnValue('/mocked/path/video.mp4');
    (statSync as jest.Mock).mockReturnValue({ size: 1000 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVideoStream', () => {
    it('should stream entire video when range is not provided', () => {
      service.getVideoStream(undefined, mockResponse as Response);

      expect(mockResponse.header).toHaveBeenCalledWith({
        'Content-Length': 1000,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      });
      expect(createReadStream).toHaveBeenCalledWith('/mocked/path/video.mp4');
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should stream partial content when range is provided', () => {
      service.getVideoStream('bytes=0-499', mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(206);
      expect(mockResponse.header).toHaveBeenCalledWith({
        'Content-Range': 'bytes 0-499/1000',
        'Accept-Ranges': 'bytes',
        'Content-Length': 500,
        'Content-Type': 'video/mp4',
      });
      expect(createReadStream).toHaveBeenCalledWith('/mocked/path/video.mp4', {
        start: 0,
        end: 499,
      });
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle errors gracefully', () => {
      (statSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      service.getVideoStream(undefined, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Gagal memuat video',
      });
    });
  });
});