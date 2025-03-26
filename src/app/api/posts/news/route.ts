import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { NewsPost } from '@/lib/db/models/NewsPost';
import { translate } from '@/lib/translate';
import { connectToDatabase } from '@/lib/db/connect';
import { AuthenticatedRequest, requireEditor } from '@/lib/auth/middleware';
import { createSlug } from '@/lib/utils/slug';
import { IUser } from '@/lib/db/models/User';
import { User } from '@/lib/db/models/User';
import { AuthorDepartment } from '@/types/news';

export async function POST(req: NextRequest) {
  try {
    console.log('뉴스 포스트 생성 요청 시작');
    
    // 에디터 권한 체크
    const user = await requireEditor(req);
    
    console.log('권한 체크 결과:', user ? '권한 있음' : '권한 없음');
    
    if (!user) {
      console.log('권한 거부: 에디터 권한 없음');
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    console.log('인증된 사용자:', user.username, '역할:', user.role, user.roles);

    // DB 연결
    await connectToDatabase();

    const data = await req.json();
    const { title, summary, content, category, author, publishDate, imageSource, tags } = data;
    
    console.log('받은 데이터 확인:', {
      title: typeof title === 'object' ? JSON.stringify(title) : title,
      author: typeof author === 'object' ? JSON.stringify(author) : author
    });

    // 필수 필드 체크
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 작성자 정보 구성
    let authorData: any = {
      name: user.username || '관리자',
      department: AuthorDepartment.ADMIN
    };
    
    try {
      // 작성자 정보 처리
      if (typeof author === 'string' && author.length > 10) {
        // MongoDB ID 형식인 경우 사용자 정보 조회 시도
        console.log('사용자 ID로 작성자 정보 조회 시도:', author);
        const userInfo = await User.findById(author);
        
        if (userInfo) {
          console.log('작성자 사용자 정보 조회 성공:', userInfo.username);
          
          // 이름 처리
          let displayName = '관리자';
          if (typeof userInfo.name === 'object' && userInfo.name) {
            displayName = `${userInfo.name.first || ''} ${userInfo.name.last || ''}`.trim();
          } else if (typeof userInfo.name === 'string' && userInfo.name) {
            displayName = userInfo.name;
          } else {
            displayName = userInfo.username;
          }
          
          // 역할 결정
          let role = userInfo.role || 'viewer';
          if (userInfo.roles && Array.isArray(userInfo.roles) && userInfo.roles.length > 0) {
            if (userInfo.roles.includes('admin')) {
              role = 'admin';
            } else if (userInfo.roles.includes('editor')) {
              role = 'editor';
            }
          }
          
          authorData = {
            id: userInfo._id.toString(),
            name: displayName,
            department: role === 'admin' ? AuthorDepartment.ADMIN : 
                        role === 'editor' ? AuthorDepartment.EDITOR : 
                        AuthorDepartment.USER
          };
        } else {
          console.log('작성자 사용자 정보를 찾을 수 없음:', author);
        }
      } else if (typeof author === 'object' && author !== null) {
        authorData = {
          name: author.name || '관리자',
          department: author.department || AuthorDepartment.ADMIN
        };
      } else if (!author || author === 'current_user') {
        // 현재 사용자 정보 사용
        authorData = {
          name: user.username || '관리자',
          department: AuthorDepartment.ADMIN
        };
      }
    } catch (error) {
      console.error('작성자 정보 처리 중 오류:', error);
      // 오류 발생 시 기본값 사용
      authorData = {
        name: user.username || '관리자',
        department: AuthorDepartment.ADMIN
      };
    }

    // 슬러그 생성
    let slug;
    try {
      console.log('슬러그 생성 시도 중 - 입력값:', typeof title === 'object' ? JSON.stringify(title) : title);
      slug = await createSlug(title);
      console.log('슬러그 생성 완료:', slug);
      
      if (!slug) {
        throw new Error('슬러그가 생성되지 않았습니다.');
      }
    } catch (error: any) {
      console.error('슬러그 생성 중 오류:', error);
      // 기본 슬러그 생성 (fallback)
      slug = `news-post-${Date.now()}`;
      console.log('기본 슬러그 사용:', slug);
    }

    console.log('포스트 생성 시도 - 데이터:', {
      title: typeof title === 'object' ? JSON.stringify(title) : title,
      slug,
      author: JSON.stringify(authorData)
    });

    // 뉴스 포스트 생성
    const newsPost = await NewsPost.create({
      title,
      slug,
      summary,
      content,
      category,
      author: authorData,
      publishDate: publishDate || new Date(),
      imageSource,
      tags: tags || [],
      isPublished: true,
      createdBy: user._id
    });

    return NextResponse.json({ 
      message: '뉴스가 성공적으로 생성되었습니다.',
      post: newsPost 
    });

  } catch (error) {
    console.error('뉴스 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '뉴스 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isPublished = searchParams.get('isPublished') !== 'false';

    const query = {
      ...(category && { category }),
      isPublished
    };

    const total = await NewsPost.countDocuments(query);
    const posts = await NewsPost.find(query)
      .sort({ publishDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name');

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 