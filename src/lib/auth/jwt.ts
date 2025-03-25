import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../db/models';

// JWT 시크릿 키 (실제 환경에서는 환경 변수로 관리)
const JWT_SECRET = process.env.JWT_SECRET || 'echoit-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '12h';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// 사용자 인증 정보 인터페이스
export interface UserAuthInfo {
  id: string;
  username: string;
  email: string;
  role: string;
}

// 토큰 타입 정의
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh'
}

// JWT 페이로드 인터페이스
export interface JWTPayload extends JwtPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  type: TokenType;
}

/**
 * 사용자 정보로 액세스 토큰 생성
 * @param user 사용자 정보
 * @returns JWT 액세스 토큰
 */
export function generateAccessToken(user: UserAuthInfo): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      type: TokenType.ACCESS
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * 사용자 정보로 리프레시 토큰 생성
 * @param user 사용자 정보
 * @returns JWT 리프레시 토큰
 */
export function generateRefreshToken(user: UserAuthInfo): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      type: TokenType.REFRESH
    },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  );
}

/**
 * 사용자 정보로 모든 토큰 생성
 * @param user 사용자 정보
 * @returns 액세스 토큰과 리프레시 토큰이 포함된 객체
 */
export function generateTokens(user: UserAuthInfo) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
}

/**
 * JWT 토큰 검증
 * @param token 검증할 JWT 토큰
 * @returns 검증 결과 (페이로드 또는 null)
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT 검증 오류:', error);
    return null;
  }
}

/**
 * 액세스 토큰 검증
 * @param token 검증할 액세스 토큰
 * @returns 검증 결과 (페이로드 또는 null)
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  const payload = verifyToken(token);

  if (!payload || payload.type !== TokenType.ACCESS) {
    return null;
  }

  return payload;
}

/**
 * 리프레시 토큰 검증
 * @param token 검증할 리프레시 토큰
 * @returns 검증 결과 (페이로드 또는 null)
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  const payload = verifyToken(token);

  if (!payload || payload.type !== TokenType.REFRESH) {
    return null;
  }

  return payload;
}

/**
 * 사용자 정보에서 인증 정보 추출
 * @param user 사용자 정보
 * @returns 인증에 필요한 사용자 정보
 */
export function extractUserAuthInfo(user: IUser): UserAuthInfo {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role
  };
}
