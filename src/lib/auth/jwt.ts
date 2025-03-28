import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { IUser } from '../db/models';

// JWT 시크릿 키 - 환경 변수에서 읽어옴
const JWT_SECRET = process.env.JWT_SECRET || 'echoit-secret-key-change-in-production';
console.log('JWT_SECRET 확인:', JWT_SECRET ? '설정됨 (길이: ' + JWT_SECRET.length + '자)' : '미설정');

// 만약 JWT_SECRET이 설정되지 않았다면 개발 서버에서 경고 표시
if (!JWT_SECRET || JWT_SECRET === 'echoit-secret-key-change-in-production') {
  console.warn('⚠️ JWT_SECRET이 기본값으로 설정되어 있습니다. 프로덕션 환경에서는 반드시 변경하세요!');
}

const JWT_EXPIRY = process.env.JWT_EXPIRY || '12h';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// 사용자 인증 정보 인터페이스
export interface UserAuthInfo {
  id: string;
  username: string;
  email: string;
  role: string;
  roles?: string[];
}

// 토큰 타입 정의
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh'
}

// JWT 페이로드 인터페이스
export interface JWTPayload extends JwtPayload {
  userId: string;
  id?: string;
  username: string;
  email: string;
  role: string;
  roles?: string[];
  type: TokenType;
}

/**
 * 사용자 정보로 액세스 토큰 생성
 * @param user 사용자 정보
 * @returns JWT 액세스 토큰
 */
export function generateAccessToken(user: UserAuthInfo): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다.');
  }
  
  // 타입 호환성을 위해 any로 변환 후 필요한 필드 추가
  const payload: any = {
    userId: user.id,  // 하위 호환성 유지
    id: user.id,      // 새로운 키 추가
    username: user.username,
    email: user.email,
    role: user.role,
    roles: user.roles,
    type: TokenType.ACCESS
  };
  
  const options: SignOptions = { expiresIn: JWT_EXPIRY };
  
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * 사용자 정보로 리프레시 토큰 생성
 * @param user 사용자 정보
 * @returns JWT 리프레시 토큰
 */
export function generateRefreshToken(user: UserAuthInfo): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET이 설정되지 않았습니다.');
  }
  
  // 타입 호환성을 위해 any로 변환 후 필요한 필드 추가
  const payload: any = {
    userId: user.id,  // 하위 호환성 유지
    id: user.id,      // 새로운 키 추가
    username: user.username,
    email: user.email,
    role: user.role,
    roles: user.roles,
    type: TokenType.REFRESH
  };
  
  const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRY };
  
  return jwt.sign(payload, JWT_SECRET, options);
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
  if (!JWT_SECRET) {
    console.error('JWT_SECRET이 설정되지 않았습니다.');
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // payload에 userId 또는 id가 없는 경우 처리
    if (!decoded.userId && !decoded.id) {
      console.error('토큰에 사용자 ID가 없습니다.');
      return null;
    }
    
    // id만 있고 userId가 없는 경우 userId 필드 추가
    if (!decoded.userId && decoded.id) {
      decoded.userId = decoded.id;
    }
    
    return decoded as JWTPayload;
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
  if (!user || !user._id) {
    console.error('유효하지 않은 사용자 정보:', user);
    throw new Error('유효하지 않은 사용자 정보입니다.');
  }
  
  // 역할 처리
  let role = 'viewer'; // 기본값은 viewer
  
  // role 필드가 문자열인 경우 (우선 사용)
  if (user.role && typeof user.role === 'string') {
    role = user.role;
  } 
  // roles 배열이 있는 경우
  else if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    role = user.roles[0];
  }
  
  // admin 사용자는 항상 admin 역할 부여
  if (user.username === 'admin') {
    role = 'admin';
  }
  
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: role,
    roles: Array.isArray(user.roles) ? user.roles : [role]
  };
}
