'use server';

import sharp from 'sharp';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { generateImageFromText, generateAIImage } from './ai';

// 이미지 저장 경로 설정
const IMAGE_BASE_PATH = path.join(process.cwd(), 'public');
const NEWS_IMAGE_PATH = path.join(IMAGE_BASE_PATH, 'images/news');
const ESG_IMAGE_PATH = path.join(IMAGE_BASE_PATH, 'images/esg');

// 이미지 크기 설정
const IMAGE_SIZES = {
  thumbnail: { width: 400, height: 300 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 900 }
};

export interface ImageProcessingResult {
  thumbnailPath: string;
  mediumPath: string;
  largePath: string;
  originalPath: string;
}

interface ImageUrls {
  thumbnailPath: string;
  mediumPath: string;
  largePath: string;
  originalPath: string;
}

interface ProcessImageOptions {
  file?: File;
  url?: string;
  type: string;
  title: string;
}

/**
 * 이미지 URL이 유효한지 확인
 */
export async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && contentType?.startsWith('image/') || false;
  } catch {
    return false;
  }
}

/**
 * Grok을 사용하여 이미지 URL 생성 (서버 사이드 전용)
 */
export async function generateImageUrl(prompt: string, type: 'news' | 'esg'): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('이 함수는 서버 사이드에서만 실행할 수 있습니다.');
  }

  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        messages: [
          {
            role: "system",
            content: "You are an image URL generator. For each request, provide a single high-quality, relevant image URL from a reliable source. The URL should be directly accessible and end with an image extension (e.g., .jpg, .png, .webp). Do not provide any explanation, just return the URL."
          },
          {
            role: "user",
            content: `Find a professional image URL for ${type} article about: ${prompt}`
          }
        ],
        model: "grok-2-latest",
        stream: false,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.XAI_API_KEY}`
        }
      }
    );

    const imageUrl = response.data.choices[0].message.content.trim();
    if (!imageUrl || !imageUrl.match(/^https?:\/\/.*\.(jpg|jpeg|png|webp|gif)$/i)) {
      throw new Error('유효하지 않은 이미지 URL');
    }

    return imageUrl;
  } catch (error) {
    console.error('이미지 URL 생성 오류:', error);
    throw error;
  }
}

/**
 * 이미지 다운로드 및 처리 (서버 사이드 전용)
 */
export async function processAndSaveImage(
  imageSource: Buffer | string | null,
  type: string,
  title: string,
  generateAI: boolean = false
): Promise<ImageUrls> {
  try {
    // 업로드 디렉토리 생성
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    await mkdir(uploadDir, { recursive: true });

    let originalImage: Buffer;
    let originalPath: string;

    if (generateAI) {
      // AI 이미지 생성
      const aiImage = await generateAIImage(title);
      if (!aiImage) {
        throw new Error('AI 이미지 생성에 실패했습니다.');
      }
      originalImage = Buffer.from(aiImage, 'base64');
      originalPath = join(uploadDir, `${Date.now()}.png`);
    } else if (imageSource) {
      if (Buffer.isBuffer(imageSource)) {
        // 이미 Buffer인 경우
        originalImage = imageSource;
      } else if (typeof imageSource === 'string') {
        // 파일 경로인 경우
        originalImage = await sharp(imageSource).toBuffer();
      } else {
        throw new Error('지원되지 않는 이미지 소스 형식입니다.');
      }
      originalPath = join(uploadDir, `${Date.now()}.png`);
    } else {
      throw new Error('이미지 소스가 없습니다.');
    }

    // 원본 이미지 저장
    await writeFile(originalPath, originalImage);
    console.log(`원본 이미지 저장 완료: ${originalPath}`);

    // 썸네일 생성 (300x200)
    const thumbnailPath = join(uploadDir, `${Date.now()}_thumb.png`);
    await sharp(originalImage)
      .resize(300, 200, { fit: 'cover' })
      .toFile(thumbnailPath);
    console.log(`썸네일 생성 완료: ${thumbnailPath}`);

    // 중간 크기 이미지 생성 (800x600)
    const mediumPath = join(uploadDir, `${Date.now()}_medium.png`);
    await sharp(originalImage)
      .resize(800, 600, { fit: 'inside' })
      .toFile(mediumPath);
    console.log(`중간 크기 이미지 생성 완료: ${mediumPath}`);

    // 큰 크기 이미지 생성 (1200x800)
    const largePath = join(uploadDir, `${Date.now()}_large.png`);
    await sharp(originalImage)
      .resize(1200, 800, { fit: 'inside' })
      .toFile(largePath);
    console.log(`큰 크기 이미지 생성 완료: ${largePath}`);

    // 상대 경로 생성 시 타입 디렉토리 포함
    const relativePath = (p: string) => `/uploads/${type}/${path.basename(p)}`;

    return {
      thumbnailPath: relativePath(thumbnailPath),
      mediumPath: relativePath(mediumPath),
      largePath: relativePath(largePath),
      originalPath: relativePath(originalPath)
    };
  } catch (error) {
    console.error('이미지 처리 오류:', error);
    throw error;
  }
}

/**
 * 이미지 리사이징 및 최적화 (서버 사이드 전용)
 */
async function processImage(
  buffer: Buffer,
  size: { width: number; height: number },
  outputPath: string
): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('이 함수는 서버 사이드에서만 실행할 수 있습니다.');
  }

  await sharp(buffer)
    .resize(size.width, size.height, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
}

/**
 * 원본 이미지 저장 (서버 사이드 전용)
 */
async function saveOriginalImage(buffer: Buffer, outputPath: string): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('이 함수는 서버 사이드에서만 실행할 수 있습니다.');
  }

  await sharp(buffer)
    .webp({ quality: 90 })
    .toFile(outputPath);

  return outputPath;
}

/**
 * 이미지 URL이 누락된 게시물에 대한 이미지 생성 및 처리 (서버 사이드 전용)
 */
export async function handleMissingImage(
  title: string,
  type: 'news' | 'esg'
): Promise<ImageProcessingResult> {
  if (typeof window !== 'undefined') {
    throw new Error('이 함수는 서버 사이드에서만 실행할 수 있습니다.');
  }

  try {
    // Grok으로 이미지 URL 생성
    const imageUrl = await generateImageUrl(title, type);
    
    // 생성된 이미지 처리 및 저장
    const fileName = title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    
    return await processAndSaveImage(null, type, fileName, true);
  } catch (error) {
    console.error('이미지 생성 및 처리 오류:', error);
    throw error;
  }
} 