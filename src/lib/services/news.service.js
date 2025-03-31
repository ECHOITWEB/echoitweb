/**
 * 통합 뉴스 서비스
 * 뉴스 관련 모든 기능을 이 서비스를 통해 처리합니다.
 */

const newsDBManager = require('../../../news-db-manager');
// 외부 slug 모듈 대신 내부에 간단한 구현

// 내부 createSlug 함수 구현
const createSlug = async (title) => {
  let titleText = '';
  
  // 제목 추출 (객체인 경우 한국어 제목 우선)
  if (typeof title === 'object' && title !== null) {
    if (title.ko) {
      titleText = title.ko;
    } else {
      // 첫 번째 속성 값 사용
      const firstValue = Object.values(title)[0];
      if (typeof firstValue === 'string') {
        titleText = firstValue;
      }
    }
  } else if (typeof title === 'string') {
    titleText = title;
  } else {
    console.error('슬러그 생성 오류: 유효하지 않은 title 형식', title);
    // 기본값 생성 (현재 타임스탬프 사용)
    return `untitled-${Date.now()}`;
  }
  
  console.log('슬러그 생성 시작:', titleText);
  
  // 한글을 로마자로 변환 (간단한 구현)
  const romanized = titleText
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // 영어가 아닌 문자 처리 (한글 등)
  const slug = romanized.length > 0 ? romanized : `news-${Date.now()}`;
  console.log('생성된 슬러그:', slug);
  
  return slug;
};

class NewsService {
  /**
   * 모든 뉴스 조회
   */
  async getAllNews() {
    try {
      return await newsDBManager.getAllNews();
    } catch (error) {
      console.error('뉴스 서비스 - 전체 뉴스 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 공개된 뉴스만 조회
   */
  async getPublishedNews() {
    try {
      return await newsDBManager.getPublishedNews();
    } catch (error) {
      console.error('뉴스 서비스 - 공개 뉴스 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 ID의 뉴스 조회
   */
  async getNewsById(id) {
    try {
      return await newsDBManager.getNewsById(id);
    } catch (error) {
      console.error(`뉴스 서비스 - ID ${id} 뉴스 조회 오류:`, error);
      throw error;
    }
  }

  /**
   * 특정 카테고리의 뉴스 조회
   */
  async getNewsByCategory(category) {
    try {
      return await newsDBManager.getNewsByCategory(category);
    } catch (error) {
      console.error(`뉴스 서비스 - 카테고리 ${category} 뉴스 조회 오류:`, error);
      throw error;
    }
  }

  /**
   * 뉴스 생성
   */
  async createNews(newsData, userId) {
    try {
      // 슬러그 생성
      let slug;
      try {
        slug = await createSlug(newsData.title.ko || newsData.title);
      } catch (error) {
        console.error('슬러그 생성 중 오류:', error);
        // 기본 슬러그 생성 (fallback)
        slug = `news-post-${Date.now()}`;
      }

      const newsWithMeta = {
        ...newsData,
        slug,
        createdBy: userId
      };

      return await newsDBManager.createNews(newsWithMeta);
    } catch (error) {
      console.error('뉴스 서비스 - 뉴스 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 뉴스 업데이트
   */
  async updateNews(id, updateData) {
    try {
      // 슬러그 업데이트가 필요한 경우 (제목이 변경된 경우)
      if (updateData.title) {
        try {
          updateData.slug = await createSlug(updateData.title.ko || updateData.title);
        } catch (error) {
          console.error('슬러그 업데이트 중 오류:', error);
          // 슬러그 업데이트 실패 시 기존 슬러그 유지 (제목만 변경)
        }
      }

      return await newsDBManager.updateNews(id, updateData);
    } catch (error) {
      console.error(`뉴스 서비스 - ID ${id} 뉴스 업데이트 오류:`, error);
      throw error;
    }
  }

  /**
   * 뉴스 삭제
   */
  async deleteNews(id) {
    try {
      return await newsDBManager.deleteNews(id);
    } catch (error) {
      console.error(`뉴스 서비스 - ID ${id} 뉴스 삭제 오류:`, error);
      throw error;
    }
  }

  /**
   * 뉴스 상태 토글 (공개/비공개)
   */
  async toggleNewsPublishStatus(id) {
    try {
      const news = await this.getNewsById(id);
      if (!news) {
        throw new Error(`ID ${id}인 뉴스를 찾을 수 없습니다.`);
      }

      const newStatus = !news.isPublished;
      return await newsDBManager.updateNews(id, { isPublished: newStatus });
    } catch (error) {
      console.error(`뉴스 서비스 - ID ${id} 뉴스 상태 토글 오류:`, error);
      throw error;
    }
  }

  /**
   * 뉴스 통계 조회
   */
  async getNewsStats() {
    try {
      return await newsDBManager.getNewsStats();
    } catch (error) {
      console.error('뉴스 서비스 - 뉴스 통계 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 제목의 뉴스 검색
   */
  async findNewsByTitle(title) {
    try {
      return await newsDBManager.getNewsByTitle(title);
    } catch (error) {
      console.error(`뉴스 서비스 - 제목 '${title}' 검색 오류:`, error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
const newsService = new NewsService();

module.exports = newsService; 