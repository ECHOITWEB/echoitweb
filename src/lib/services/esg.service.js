/**
 * ESG 서비스 모듈
 * 모든 ESG 게시물 관련 비즈니스 로직을 처리합니다.
 */

// ESG 데이터베이스 매니저 가져오기
const esgDBManager = require('../../../esg-db-manager');
const { ObjectId } = require('mongodb');

// 로깅 설정
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * ESG 서비스 클래스
 */
class ESGService {
  constructor() {
    this.manager = esgDBManager;
  }

  /**
   * 모든 ESG 게시물 조회
   * @param {Object} options 검색 옵션 (페이지, 정렬 등)
   * @returns {Promise<Array>} ESG 게시물 배열
   */
  async getAllESG(options = {}) {
    try {
      DEBUG && console.log('[ESGService] 모든 ESG 게시물 요청', options);
      const result = await this.manager.getAllESG();
      DEBUG && console.log(`[ESGService] ${result.length}개의 ESG 게시물 조회됨`);
      return result;
    } catch (error) {
      console.error('[ESGService] ESG 게시물 조회 오류:', error);
      return [];
    }
  }

  /**
   * ID로 ESG 게시물 조회
   * @param {string} id ESG 게시물 ID
   * @returns {Promise<Object|null>} ESG 게시물 객체 또는 null
   */
  async getESGById(id) {
    try {
      DEBUG && console.log(`[ESGService] ID ${id}로 ESG 게시물 요청`);
      const result = await this.manager.getESGById(id);
      DEBUG && console.log(`[ESGService] ESG 게시물 조회 결과:`, 
        result ? `ID: ${result._id}, 제목: ${result.title?.ko}` : '없음');
      return result;
    } catch (error) {
      console.error(`[ESGService] ESG 게시물 ID ${id} 조회 오류:`, error);
      return null;
    }
  }

  /**
   * 제목으로 ESG 게시물 검색
   * @param {string} title 검색할 제목
   * @returns {Promise<Array>} 일치하는 ESG 게시물 배열
   */
  async getESGByTitle(title) {
    try {
      DEBUG && console.log(`[ESGService] 제목 '${title}'로 ESG 게시물 검색`);
      const result = await this.manager.getESGByTitle(title);
      DEBUG && console.log(`[ESGService] '${title}' 제목 검색 결과: ${result.length}개의 게시물 찾음`);
      return result;
    } catch (error) {
      console.error(`[ESGService] 제목 '${title}' 검색 오류:`, error);
      return [];
    }
  }

  /**
   * 카테고리로 ESG 게시물 검색
   * @param {string} category 검색할 카테고리
   * @returns {Promise<Array>} 일치하는 ESG 게시물 배열
   */
  async getESGByCategory(category) {
    try {
      DEBUG && console.log(`[ESGService] 카테고리 '${category}'로 ESG 게시물 검색`);
      const result = await this.manager.getESGByCategory(category);
      DEBUG && console.log(`[ESGService] '${category}' 카테고리 검색 결과: ${result.length}개의 게시물 찾음`);
      return result;
    } catch (error) {
      console.error(`[ESGService] 카테고리 '${category}' 검색 오류:`, error);
      return [];
    }
  }

  /**
   * 공개된 ESG 게시물만 조회
   * @returns {Promise<Array>} 공개된 ESG 게시물 배열
   */
  async getPublishedESG() {
    try {
      DEBUG && console.log(`[ESGService] 공개된 ESG 게시물 요청`);
      const result = await this.manager.getPublishedESG();
      DEBUG && console.log(`[ESGService] 공개된 ESG 게시물 검색 결과: ${result.length}개의 게시물 찾음`);
      return result;
    } catch (error) {
      console.error(`[ESGService] 공개된 ESG 게시물 조회 오류:`, error);
      return [];
    }
  }

  /**
   * ESG 게시물 생성
   * @param {Object} esgData ESG 게시물 데이터
   * @returns {Promise<Object>} 생성 결과
   */
  async createESG(esgData) {
    try {
      DEBUG && console.log(`[ESGService] ESG 게시물 생성 요청:`, JSON.stringify(esgData).slice(0, 200) + '...');
      const result = await this.manager.createESG(esgData);
      
      if (result.success) {
        DEBUG && console.log(`[ESGService] ESG 게시물 생성 성공: ID ${result.id}`);
      } else {
        console.error(`[ESGService] ESG 게시물 생성 실패:`, result.error);
      }
      
      return result;
    } catch (error) {
      console.error(`[ESGService] ESG 게시물 생성 오류:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ESG 게시물 업데이트
   * @param {string} id 업데이트할 ESG 게시물 ID
   * @param {Object} updateData 업데이트 데이터
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateESG(id, updateData) {
    try {
      DEBUG && console.log(`[ESGService] ID ${id} ESG 게시물 업데이트 요청:`, JSON.stringify(updateData).slice(0, 200) + '...');
      const result = await this.manager.updateESG(id, updateData);
      
      if (result.success) {
        DEBUG && console.log(`[ESGService] ESG 게시물 업데이트 성공: ID ${id}`);
      } else {
        console.error(`[ESGService] ESG 게시물 업데이트 실패:`, result.error);
      }
      
      return result;
    } catch (error) {
      console.error(`[ESGService] ESG 게시물 업데이트 오류:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ESG 게시물 삭제
   * @param {string} id 삭제할 ESG 게시물 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteESG(id) {
    try {
      DEBUG && console.log(`[ESGService] ID ${id} ESG 게시물 삭제 요청`);
      const result = await this.manager.deleteESG(id);
      
      if (result.success) {
        DEBUG && console.log(`[ESGService] ESG 게시물 삭제 성공: ID ${id}`);
      } else {
        console.error(`[ESGService] ESG 게시물 삭제 실패:`, result.error);
      }
      
      return result;
    } catch (error) {
      console.error(`[ESGService] ESG 게시물 삭제 오류:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ESG 게시물 통계 조회
   * @returns {Promise<Object>} ESG 게시물 통계
   */
  async getESGStats() {
    try {
      DEBUG && console.log(`[ESGService] ESG 게시물 통계 요청`);
      const result = await this.manager.getESGStats();
      DEBUG && console.log(`[ESGService] ESG 게시물 통계 결과:`, result);
      return result;
    } catch (error) {
      console.error(`[ESGService] ESG 게시물 통계 조회 오류:`, error);
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
const esgService = new ESGService();
module.exports = esgService; 