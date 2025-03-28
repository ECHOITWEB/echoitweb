/**
 * 사용자 서비스 - 사용자 관련 모든 작업을 통합 관리
 */
import { connectToDatabase } from '@/lib/db/connect';
import { User, UserRole, type IUser } from '@/lib/db/models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 토큰 인터페이스
interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// 이름 인터페이스 (name 필드의 구조적 타입 정의)
interface UserName {
  first: string;
  last: string;
}

// 안전한 사용자 객체 (비밀번호 제외)
export interface SafeUser {
  id: string;           // _id 대신 id로 표준화 (프론트엔드 컴포넌트와 일치)
  username: string;
  email: string;
  name: string;         // 표시용 문자열로 변환된 이름
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date;
}

// 사용자 생성/업데이트 시 사용하는 데이터 인터페이스
export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  name: string | UserName;
  role: string;
  isActive?: boolean;
}

// 사용자 업데이트 시 사용하는 데이터 인터페이스
export interface UserUpdateData {
  email?: string;
  password?: string;
  name?: string | UserName;
  role?: string;
  isActive?: boolean;
}

/**
 * 사용자 서비스 클래스
 */
class UserService {
  /**
   * 데이터베이스 연결
   */
  private async ensureDbConnection(): Promise<void> {
    try {
      await connectToDatabase();
    } catch (error) {
      console.error('DB 연결 오류:', error);
      throw new Error('데이터베이스 연결에 실패했습니다');
    }
  }

  /**
   * 이메일로 사용자 찾기
   */
  async findByEmail(email: string, includePassword: boolean = false): Promise<IUser | null> {
    await this.ensureDbConnection();
    try {
      return includePassword
        ? await User.findOne({ email }).select('+password')
        : await User.findOne({ email });
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      throw new Error('사용자 조회 중 오류가 발생했습니다');
    }
  }

  /**
   * ID로 사용자 찾기
   */
  async findById(id: string): Promise<IUser | null> {
    await this.ensureDbConnection();
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('사용자 ID 조회 오류:', error);
      throw new Error('사용자 ID 조회 중 오류가 발생했습니다');
    }
  }

  /**
   * 사용자명으로 사용자 찾기
   */
  async findByUsername(username: string, includePassword: boolean = false): Promise<IUser | null> {
    await this.ensureDbConnection();
    try {
      return includePassword
        ? await User.findOne({ username }).select('+password')
        : await User.findOne({ username });
    } catch (error) {
      console.error('사용자명 조회 오류:', error);
      throw new Error('사용자명 조회 중 오류가 발생했습니다');
    }
  }

  /**
   * 안전하게 객체ID를 문자열로 변환
   */
  private safeObjectIdToString(obj: any): string {
    try {
      // Document나 ObjectId를 안전하게 처리
      if (obj && obj.toString) {
        return obj.toString();
      }
      // 이미 문자열이면 그대로 반환
      if (typeof obj === 'string') {
        return obj;
      }
    } catch (error) {
      console.error('ID 변환 오류:', error);
    }
    
    // 기본값으로 빈 문자열 반환
    return '';
  }

  /**
   * 사용자 로그인 처리
   */
  async login(email: string, password: string): Promise<{ user: SafeUser; tokens: Tokens }> {
    await this.ensureDbConnection();

    // 사용자 찾기
    const user = await this.findByEmail(email, true);
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    // JWT 시크릿 확인
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET이 설정되지 않았습니다');
    }

    // userId 안전하게 가져오기
    const userId = this.safeObjectIdToString(user._id);

    // 토큰 생성
    const tokens = {
      accessToken: jwt.sign(
        { id: userId, role: user.role },
        jwtSecret,
        { expiresIn: '1d' }
      ),
      refreshToken: jwt.sign(
        { id: userId },
        jwtSecret,
        { expiresIn: '7d' }
      )
    };

    // 마지막 로그인 시간 업데이트
    this.updateLastLogin(userId);

    // 안전한 사용자 객체 반환
    return {
      user: this.createSafeUser(user),
      tokens
    };
  }

  /**
   * 마지막 로그인 시간 업데이트
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.ensureDbConnection();
    try {
      await User.findByIdAndUpdate(
        userId,
        { $set: { lastLogin: new Date() } }
      );
    } catch (error) {
      console.error('마지막 로그인 시간 업데이트 오류:', error);
      // 비 치명적 오류이므로 예외를 던지지 않음
    }
  }

  /**
   * 안전한 사용자 객체 생성 (비밀번호 제외)
   * AuthorSelect 컴포넌트 및 admin/users와 일관된 형식
   */
  createSafeUser(user: IUser): SafeUser {
    // userId 안전하게 가져오기
    const userId = this.safeObjectIdToString(user._id);
    
    // 이름 처리 - UserName 타입이나 문자열 둘 다 처리
    let formattedName = '';
    if (typeof user.name === 'object' && user.name) {
      const userName = user.name as unknown as UserName;
      formattedName = `${userName.first || ''} ${userName.last || ''}`.trim();
    } else if (typeof user.name === 'string') {
      formattedName = user.name;
    } else {
      formattedName = user.email.split('@')[0];
    }

    return {
      id: userId,                           // _id 대신 id 사용
      username: user.username || user.email.split('@')[0],
      email: user.email,
      name: formattedName,
      role: user.role,
      isActive: user.isActive || false,
      createdAt: user.createdAt || new Date(),
      lastLogin: user.lastLogin || new Date()
    };
  }

  /**
   * 토큰 검증
   */
  verifyToken(token: string): { id: string; role?: string } {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET이 설정되지 않았습니다');
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as { id: string; role?: string };
      return decoded;
    } catch (error) {
      console.error('토큰 검증 오류:', error);
      throw new Error('유효하지 않은 토큰입니다');
    }
  }
  
  /**
   * 모든 사용자 목록 조회
   */
  async getAllUsers(): Promise<SafeUser[]> {
    await this.ensureDbConnection();
    try {
      const users = await User.find({}).sort({ role: 1, createdAt: -1 });
      return users.map(user => this.createSafeUser(user));
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error);
      throw new Error('사용자 목록 조회 중 오류가 발생했습니다');
    }
  }
  
  /**
   * 활성 사용자 목록 조회
   */
  async getActiveUsers(): Promise<SafeUser[]> {
    await this.ensureDbConnection();
    try {
      const users = await User.find({ isActive: true }).sort({ role: 1, username: 1 });
      return users.map(user => this.createSafeUser(user));
    } catch (error) {
      console.error('활성 사용자 목록 조회 오류:', error);
      throw new Error('활성 사용자 목록 조회 중 오류가 발생했습니다');
    }
  }

  /**
   * 새 사용자 생성
   */
  async createUser(userData: UserCreateData): Promise<SafeUser> {
    await this.ensureDbConnection();

    // username 또는 email 중복 확인
    const existingUser = await User.findOne({
      $or: [
        { username: userData.username },
        { email: userData.email }
      ]
    });

    if (existingUser) {
      if (existingUser.username === userData.username) {
        throw new Error('이미 사용 중인 사용자 이름입니다.');
      }
      throw new Error('이미 사용 중인 이메일 주소입니다.');
    }

    // 역할 검증
    if (!Object.values(UserRole).includes(userData.role as UserRole)) {
      throw new Error('유효하지 않은 사용자 역할입니다.');
    }

    // 사용자 role과 roles 설정 (일관성 유지)
    const userRole = userData.role as UserRole;
    const userRoles = [userRole];

    // 새 사용자 생성 및 저장
    const newUser = new User({
      username: userData.username,
      email: userData.email,
      password: userData.password, // 모델에서 저장 전에 해시됨
      name: userData.name,
      role: userRole,
      roles: userRoles,
      isActive: userData.isActive !== false, // 기본값 true
      lastLogin: new Date()
    });

    await newUser.save();
    return this.createSafeUser(newUser);
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateUser(userId: string, userData: UserUpdateData): Promise<SafeUser> {
    await this.ensureDbConnection();

    // 대상 사용자 존재 확인
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 기본 관리자('admin' 사용자)의 역할 변경 방지
    if (user.username === 'admin' && userData.role && userData.role !== UserRole.ADMIN) {
      throw new Error('기본 관리자의 역할은 변경할 수 없습니다.');
    }

    // 이메일 중복 확인
    if (userData.email && userData.email !== user.email) {
      const existingUser = await User.findOne({
        email: userData.email,
        _id: { $ne: userId }
      });

      if (existingUser) {
        throw new Error('이미 사용 중인 이메일 주소입니다.');
      }
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    
    // 이메일 업데이트
    if (userData.email) {
      updateData.email = userData.email;
    }
    
    // 이름 업데이트
    if (userData.name) {
      updateData.name = userData.name;
    }
    
    // 역할 업데이트
    if (userData.role) {
      if (!Object.values(UserRole).includes(userData.role as UserRole)) {
        throw new Error('유효하지 않은 사용자 역할입니다.');
      }
      updateData.role = userData.role;
      updateData.roles = [userData.role]; // roles 배열도 함께 업데이트
    }
    
    // 활성 상태 업데이트
    if (userData.isActive !== undefined) {
      updateData.isActive = userData.isActive;
    }
    
    // 비밀번호 업데이트 (제공된 경우에만)
    if (userData.password && userData.password.trim() !== '') {
      user.password = userData.password; // 모델에서 저장 전에 해시됨
    }

    // 사용자 정보 업데이트
    Object.assign(user, updateData);
    await user.save();
    
    return this.createSafeUser(user);
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(userId: string, requesterId: string): Promise<void> {
    await this.ensureDbConnection();

    // 대상 사용자 존재 확인
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 기본 관리자('admin' 사용자) 삭제 방지
    if (user.username === 'admin') {
      throw new Error('기본 관리자 계정은 삭제할 수 없습니다.');
    }

    // 자기 자신을 삭제하려는 경우 방지
    if (requesterId === userId) {
      throw new Error('자기 자신을 삭제할 수 없습니다.');
    }

    // 요청자 확인 (관리자 여부)
    const requester = await User.findById(requesterId);
    if (!requester || requester.role !== UserRole.ADMIN) {
      throw new Error('사용자 삭제 권한이 없습니다.');
    }

    // 다른 관리자를 일반 관리자가 삭제하려는 경우 방지
    if (user.role === UserRole.ADMIN && requester.username !== 'admin') {
      throw new Error('다른 관리자를 삭제할 권한이 없습니다.');
    }

    // 사용자 삭제
    await User.findByIdAndDelete(userId);
  }
}

// 싱글톤 인스턴스
const userService = new UserService();
export default userService; 