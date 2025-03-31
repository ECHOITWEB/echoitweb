/**
 * ESG 데이터베이스 관리 스크립트
 * 모든 ESG 관련 데이터베이스 작업을 이 스크립트를 통해 수행합니다.
 */

const { MongoClient, ObjectId } = require('mongodb');
// src/lib/db.ts의 connectDB 함수 가져오기
const { connectDB } = require('./src/lib/db');
// .env 파일 로드
require('dotenv').config();

class ESGDBManager {
  constructor() {
    this.dbName = 'echoit';
    this.collectionName = 'esgposts';
    this.client = null;
    this.db = null;
    this.collection = null;
    this.isConnecting = false; // 연결 중인지 상태 추가
    this.connectionFailed = false; // 연결 실패 여부
    this.lastConnectionAttempt = 0; // 마지막 연결 시도 시간
    this.connectionRetryInterval = 5000; // 5초마다 재시도
    this.maxRetries = 3; // 최대 재시도 횟수
    this.currentRetries = 0; // 현재 재시도 횟수
  }

  /**
   * 데이터베이스 연결
   */
  async connect() {
    // 이미 연결되어 있는 경우
    if (this.client && this.db && this.collection) {
      return this.collection;
    }
    
    // 현재 연결 중인 경우, 잠시 대기
    if (this.isConnecting) {
      console.log('연결 진행 중 - 대기 중...');
      // 최대 5번, 100ms 간격으로 연결 완료 대기
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (this.client && this.db && this.collection) {
          return this.collection;
        }
      }
    }
    
    // 이전 연결이 실패했고, 재시도 대기 시간이 지나지 않았으면 빈 컬렉션 반환
    const now = Date.now();
    if (this.connectionFailed && 
        (now - this.lastConnectionAttempt < this.connectionRetryInterval) && 
        this.currentRetries >= this.maxRetries) {
      console.log('이전 연결 시도 실패 후 대기 중 - 임시 null 컬렉션 반환');
      return null;
    }
    
    this.isConnecting = true;
    this.lastConnectionAttempt = now;
    
    try {
      // 글로벌 MongoDB 연결 사용
      console.log('글로벌 MongoDB 연결 사용 시도 중...');
      const mongoose = await connectDB();
      
      if (!mongoose) {
        throw new Error('MongoDB 연결에 실패했습니다.');
      }
      
      // 연결이 성공하면 mongoose 객체에서 native 연결 가져오기
      this.client = mongoose.connection.getClient();
      this.db = this.client.db(this.dbName);
      
      if (!this.db) {
        throw new Error('데이터베이스 객체를 가져올 수 없습니다.');
      }
      
      this.collection = this.db.collection(this.collectionName);
      if (!this.collection) {
        throw new Error('컬렉션 객체를 가져올 수 없습니다.');
      }
      
      console.log('글로벌 MongoDB 연결 성공적으로 사용 중');
      
      // 연결 성공 시 상태 초기화
      this.connectionFailed = false;
      this.currentRetries = 0;
      
      return this.collection;
    } catch (error) {
      console.error('DB 연결 오류:', error);
      this.connectionFailed = true;
      this.currentRetries++;
      
      this.client = null;
      this.db = null;
      this.collection = null;
      
      console.log(`MongoDB 연결 실패 (시도 ${this.currentRetries}/${this.maxRetries})`);
      return null; // 연결 실패 시 null 반환
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * 연결 종료 (실제로는 더 이상 사용되지 않음 - 글로벌 연결 사용)
   */
  async close() {
    // 글로벌 연결을 사용하므로 실제로 연결을 닫지 않음
    console.log('글로벌 MongoDB 연결 사용 중 - 개별 연결 종료 호출 무시');
    // 로컬 참조만 정리
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  /**
   * 모든 ESG 게시물 조회
   */
  async getAllESG() {
    try {
      // 연결 시도
      const collection = await this.connect();
      
      // 연결이 실패한 경우에 대한 추가 검사
      if (!collection) {
        console.error('ESG 게시물 조회 실패: MongoDB 컬렉션에 연결되지 않았습니다.');
        return []; // 빈 배열 반환
      }
      
      const esgPosts = await collection.find({}).toArray();
      console.log(`조회 결과: ${esgPosts.length}개의 ESG 게시물 (총 ${esgPosts.length}개)`);
      return esgPosts;
    } catch (error) {
      console.error('ESG 게시물 조회 오류:', error);
      return []; // 오류 발생 시 빈 배열 반환
    }
  }

  /**
   * 특정 ID의 ESG 게시물 조회
   */
  async getESGById(id) {
    try {
      // 연결 시도
      const collection = await this.connect();
      
      // 연결이 실패한 경우에 대한 추가 검사
      if (!collection) {
        console.error(`ID ${id}인 ESG 게시물 조회 실패: MongoDB 컬렉션에 연결되지 않았습니다.`);
        return null;
      }
      
      const esgPost = await collection.findOne({ _id: new ObjectId(id) });
      return esgPost;
    } catch (error) {
      console.error(`ID ${id}인 ESG 게시물 조회 오류:`, error);
      return null;
    }
  }

  /**
   * 특정 제목의 ESG 게시물 조회
   */
  async getESGByTitle(title) {
    try {
      // 연결 시도
      const collection = await this.connect();
      
      // 연결이 실패한 경우에 대한 추가 검사
      if (!collection) {
        console.error(`제목 '${title}'인 ESG 게시물 조회 실패: MongoDB 컬렉션에 연결되지 않았습니다.`);
        return [];
      }
      
      const esgPosts = await collection.find({ 'title.ko': title }).toArray();
      return esgPosts;
    } catch (error) {
      console.error(`제목 '${title}'인 ESG 게시물 조회 오류:`, error);
      return [];
    }
  }

  /**
   * 특정 카테고리의 ESG 게시물 조회
   */
  async getESGByCategory(category) {
    try {
      // 연결 시도
      const collection = await this.connect();
      
      // 연결이 실패한 경우에 대한 추가 검사
      if (!collection) {
        console.error(`카테고리 '${category}'인 ESG 게시물 조회 실패: MongoDB 컬렉션에 연결되지 않았습니다.`);
        return [];
      }
      
      const esgPosts = await collection.find({ category }).toArray();
      console.log(`카테고리 '${category}'에서 ${esgPosts.length}개의 ESG 게시물을 조회했습니다.`);
      return esgPosts;
    } catch (error) {
      console.error(`카테고리 '${category}'인 ESG 게시물 조회 오류:`, error);
      return [];
    }
  }

  /**
   * 공개된 ESG 게시물만 조회
   */
  async getPublishedESG() {
    try {
      // 연결 시도
      const collection = await this.connect();
      
      // 연결이 실패한 경우에 대한 추가 검사
      if (!collection) {
        console.error('공개된 ESG 게시물 조회 실패: MongoDB 컬렉션에 연결되지 않았습니다.');
        return [];
      }
      
      const esgPosts = await collection.find({ isPublished: true }).toArray();
      console.log(`공개된 ${esgPosts.length}개의 ESG 게시물을 조회했습니다.`);
      return esgPosts;
    } catch (error) {
      console.error('공개된 ESG 게시물 조회 오류:', error);
      return [];
    }
  }

  /**
   * ESG 게시물 생성
   */
  async createESG(esgData) {
    try {
      // 연결 시도
      const collection = await this.connect();
      
      // 연결이 실패한 경우에 대한 추가 검사
      if (!collection) {
        console.error('ESG 게시물 생성 실패: MongoDB 컬렉션에 연결되지 않았습니다.');
        throw new Error('DB 연결 실패');
      }
      
      // 필수 필드 검증
      if (!esgData.title || !esgData.content || !esgData.category) {
        throw new Error('필수 필드가 누락되었습니다 (title, content, category)');
      }
      
      // 현재 날짜 설정
      const now = new Date();
      
      // 기본값 설정
      const esgPost = {
        ...esgData,
        createdAt: esgData.createdAt || now,
        updatedAt: now,
        publishDate: esgData.publishDate || now,
        viewCount: esgData.viewCount || 0,
        isPublished: esgData.isPublished !== undefined ? esgData.isPublished : true,
        isMainFeatured: esgData.isMainFeatured !== undefined ? esgData.isMainFeatured : false,
        tags: esgData.tags || [],
      };
      
      // ESG 생성
      const result = await collection.insertOne(esgPost);
      console.log(`ESG 게시물 생성 성공: ${result.insertedId}`);
      
      return {
        success: true,
        id: result.insertedId,
        esgPost
      };
    } catch (error) {
      console.error('ESG 게시물 생성 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ESG 게시물 업데이트
   */
  async updateESG(id, updateData) {
    try {
      // 연결 시도
      const collection = await this.connect();
      
      // 연결이 실패한 경우에 대한 추가 검사
      if (!collection) {
        console.error(`ESG 게시물 업데이트 실패: MongoDB 컬렉션에 연결되지 않았습니다.`);
        throw new Error('DB 연결 실패');
      }
      
      // 현재 시간 기록
      updateData.updatedAt = new Date();
      
      // ID 검증
      const objectId = new ObjectId(id);
      
      // 업데이트 실행
      const result = await collection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        throw new Error(`ID가 ${id}인 ESG 게시물을 찾을 수 없습니다.`);
      }
      
      console.log(`ESG 게시물 업데이트 성공: ${id}`);
      return {
        success: true,
        id: id,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      console.error(`ESG 게시물 업데이트 오류:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ESG 게시물 삭제
   */
  async deleteESG(id) {
    try {
      // 연결 시도
      const collection = await this.connect();
      
      // 연결이 실패한 경우에 대한 추가 검사
      if (!collection) {
        console.error(`ESG 게시물 삭제 실패: MongoDB 컬렉션에 연결되지 않았습니다.`);
        throw new Error('DB 연결 실패');
      }
      
      // ID 검증
      const objectId = new ObjectId(id);
      
      // 삭제 실행
      const result = await collection.deleteOne({ _id: objectId });
      
      if (result.deletedCount === 0) {
        throw new Error(`ID가 ${id}인 ESG 게시물을 찾을 수 없습니다.`);
      }
      
      console.log(`ESG 게시물 삭제 성공: ${id}`);
      return {
        success: true,
        id: id,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error(`ESG 게시물 삭제 오류:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ESG 게시물 통계 가져오기
   */
  async getESGStats() {
    try {
      // 연결 시도
      const collection = await this.connect();
      
      // 연결이 실패한 경우에 대한 추가 검사
      if (!collection) {
        console.error('ESG 게시물 통계 조회 실패: MongoDB 컬렉션에 연결되지 않았습니다.');
        return {
          total: 0,
          published: 0,
          unpublished: 0,
          byCategory: {}
        };
      }
      
      // 전체 ESG 게시물 수
      const total = await collection.countDocuments();
      
      // 발행된 ESG 게시물 수
      const published = await collection.countDocuments({ isPublished: true });
      
      // 발행되지 않은 ESG 게시물 수
      const unpublished = await collection.countDocuments({ isPublished: false });
      
      // 카테고리별 ESG 게시물 수 (파이프라인 사용)
      const categoryCounts = await collection
        .aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ])
        .toArray();
      
      // 카테고리별 카운트를 객체로 변환
      const byCategory = {};
      categoryCounts.forEach(item => {
        byCategory[item._id] = item.count;
      });
      
      const stats = {
        total,
        published,
        unpublished,
        byCategory
      };
      
      console.log('ESG 게시물 통계 조회 성공:', stats);
      
      return stats;
    } catch (error) {
      console.error('ESG 게시물 통계 조회 오류:', error);
      return {
        total: 0,
        published: 0,
        unpublished: 0,
        byCategory: {}
      };
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const esgDBManager = new ESGDBManager();
module.exports = esgDBManager; 