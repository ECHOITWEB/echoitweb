"use server";

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AuthorDepartment } from '@/types/news';

export async function POST(req: Request) {
  try {
    const { name, department } = await req.json();

    if (!name || !department) {
      return NextResponse.json(
        { error: '작성자 이름과 부서는 필수입니다.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // 이미 존재하는 작성자인지 확인
    const existingAuthor = await db.collection('authors').findOne({ name, department });
    if (existingAuthor) {
      return NextResponse.json(
        { message: '이미 등록된 작성자입니다.' },
        { status: 200 }
      );
    }

    // 새 작성자 저장
    await db.collection('authors').insertOne({
      name,
      department,
      createdAt: new Date()
    });

    return NextResponse.json(
      { message: '작성자가 성공적으로 저장되었습니다.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('작성자 저장 오류:', error);
    return NextResponse.json(
      { error: '작성자 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const authors = await db.collection('authors')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(authors);
  } catch (error) {
    console.error('작성자 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '작성자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 