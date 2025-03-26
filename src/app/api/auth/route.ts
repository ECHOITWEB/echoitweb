import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User, IUser } from '@/lib/db/models';
import { generateTokens, extractUserAuthInfo, verifyRefreshToken, verifyAccessToken } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

/**
 * 로그인 API
 */
export async function POST(request: NextRequest) {
  try {
    console.log('로그인 요청 받음');
    const { username, password } = await request.json();
    console.log('로그인 시도:', username);

    if (!username || !password) {
      console.log('아이디 또는 비밀번호 누락');
      return NextResponse.json({
        success: false,
        message: '사용자명과 비밀번호를 입력해주세요.',
      });
    }

    // MongoDB 연결
    console.log('MongoDB 연결 시도');
    const db = await connectToDatabase();
    console.log('MongoDB 연결 성공');

    // 사용자 조회 - User는 컬렉션 이름이므로 db.collection을 사용
    console.log('사용자 조회 시도:', username);
    const usersCollection = db.collection(User);
    let user = await usersCollection.findOne({ username }) as IUser | null;
    console.log('사용자 조회 결과:', user ? '사용자 찾음' : '사용자 없음');

    // 최초 실행 시 admin 계정이 없으면 생성
    if (!user && username === 'admin') {
      console.log('admin 계정 자동 생성 시도');
      const hashedPassword = await bcrypt.hash('echoit1111@', 10);
      const newUser: IUser = {
        username: 'admin',
        email: 'admin@echoit.co.kr',
        password: hashedPassword,
        name: '관리자',
        department: '관리팀',
        roles: ['admin'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      };

      try {
        const result = await usersCollection.insertOne(newUser);
        user = {
          ...newUser,
          _id: result.insertedId
        };
        console.log('관리자 계정이 생성되었습니다.');
      } catch (saveError) {
        console.error('관리자 계정 생성 오류:', saveError);
        return NextResponse.json({
          success: false,
          message: '관리자 계정 생성 중 오류가 발생했습니다.'
        });
      }
    }

    if (!user || !user.isActive) {
      console.log('사용자 없음 또는 비활성화됨');
      return NextResponse.json({
        success: false,
        message: '사용자를 찾을 수 없거나 비활성화된 계정입니다.',
      });
    }

    // 비밀번호 검증
    console.log('비밀번호 검증 시도');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('비밀번호 검증 결과:', isValidPassword ? '일치' : '불일치');

    if (!isValidPassword) {
      console.log('비밀번호 불일치');
      return NextResponse.json({
        success: false,
        message: '비밀번호가 일치하지 않습니다.',
      });
    }

    // 마지막 로그인 시간 업데이트
    console.log('마지막 로그인 시간 업데이트 시도');
    const now = new Date();
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: now } }
    );
    console.log('마지막 로그인 시간 업데이트 성공');
    
    // 메모리 상의 user 객체도 업데이트
    user.lastLogin = now;

    // 토큰 생성 - role은 문자열로 처리
    console.log('토큰 생성 시도');
    
    // 역할 확인
    let userRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'viewer';
    
    // admin 계정은 항상 admin 역할을 갖도록 설정
    if (user.username === 'admin') {
      userRole = 'admin';
    }
    
    console.log('최종 사용자 역할:', userRole);
    
    const tokens = generateTokens({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: userRole
    });
    console.log('토큰 생성 성공');

    // 응답 데이터 구성
    const userData = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      name: user.name,
      role: userRole,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    };
    console.log('응답 데이터 구성 완료');

    // 응답 생성
    const response = NextResponse.json({
      success: true,
      data: {
        user: userData,
      },
      tokens,
    });

    // 쿠키에 토큰 설정 (httpOnly는 false로 설정하여 클라이언트 JavaScript에서 접근 가능하게)
    response.cookies.set({
      name: 'echoit_auth_token',
      value: tokens.accessToken,
      path: '/',
      maxAge: 60 * 60 * 24, // 24시간
      sameSite: 'lax',
      httpOnly: false,
    });

    console.log('쿠키 설정 완료:', tokens.accessToken.substring(0, 10) + '...');

    return response;

  } catch (error) {
    console.error('로그인 처리 중 오류 발생:', error);
    return NextResponse.json({
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다.',
    });
  }
}

/**
 * 토큰 갱신 API
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        message: '리프레시 토큰이 필요합니다.'
      }, { status: 400 });
    }

    // 리프레시 토큰 검증
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않거나 만료된 리프레시 토큰입니다.'
      }, { status: 401 });
    }

    try {
      // 데이터베이스 연결
      const db = await connectToDatabase();
      
      // 사용자 정보 검증 - userId가 아닌 id를 사용
      const usersCollection = db.collection(User);
      const user = await usersCollection.findOne({ _id: new ObjectId(payload.id) }) as IUser | null;
      
      if (!user || !user.isActive) {
        return NextResponse.json({
          success: false,
          message: '사용자를 찾을 수 없거나 비활성화된 계정입니다.'
        }, { status: 404 });
      }
      
      // 새 토큰 발급
      const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'viewer';
      const tokens = generateTokens({
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: userRole
      });
      
      // 응답 생성
      const response = NextResponse.json({
        success: true,
        tokens
      });
      
      // 쿠키에 새 액세스 토큰 설정
      response.cookies.set({
        name: 'echoit_auth_token',
        value: tokens.accessToken,
        path: '/',
        maxAge: 60 * 60 * 24, // 24시간
        sameSite: 'lax',
        httpOnly: false,
      });
      
      return response;
      
    } catch (dbError) {
      console.error('데이터베이스 연결 오류:', dbError);
      return NextResponse.json({
        success: false,
        message: '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('토큰 갱신 처리 중 오류 발생:', error);
    return NextResponse.json({
      success: false,
      message: '토큰 갱신 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * 토큰 검증 및 사용자 정보 API
 */
export async function GET(request: NextRequest) {
  try {
    // 토큰 추출
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      console.log('토큰이 제공되지 않음');
      return NextResponse.json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      }, { status: 401 });
    }
    
    // 토큰 검증
    const authInfo = verifyAccessToken(token);
    if (!authInfo) {
      console.log('토큰 검증 실패');
      return NextResponse.json({
        success: false,
        message: '유효하지 않거나 만료된 토큰입니다.'
      }, { status: 401 });
    }
    
    try {
      // 데이터베이스 연결
      const db = await connectToDatabase();
      
      // 사용자 조회
      const usersCollection = db.collection(User);
      const user = await usersCollection.findOne({ _id: new ObjectId(authInfo.id) }) as IUser | null;
      
      if (!user || !user.isActive) {
        return NextResponse.json({
          success: false,
          message: '사용자를 찾을 수 없거나 비활성화된 계정입니다.'
        }, { status: 404 });
      }
      
      // 응답 데이터 구성
      const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'viewer';
      const userData = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name,
        role: userRole,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString(),
      };
      
      return NextResponse.json({
        success: true,
        user: userData
      });
      
    } catch (dbError) {
      console.error('사용자 정보 조회 중 오류 발생:', dbError);
      return NextResponse.json({
        success: false,
        message: '사용자 정보를 조회하는 중 오류가 발생했습니다.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('사용자 정보 조회 중 오류 발생:', error);
    return NextResponse.json({
      success: false,
      message: '사용자 정보 조회 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
