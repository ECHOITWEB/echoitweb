/**
 * 뉴스 DB 관리자 테스트 스크립트
 */

const newsDBManager = require('./news-db-manager');

async function runTest() {
  try {
    console.log('--- 뉴스 DB 관리자 테스트 시작 ---');
    
    // 모든 뉴스 조회
    console.log('\n1. 모든 뉴스 조회:');
    const allNews = await newsDBManager.getAllNews();
    console.log(`총 ${allNews.length}개의 뉴스 존재`);
    
    // 첫 번째 뉴스 ID 가져오기
    const firstNewsId = allNews[0]._id.toString();
    
    // 단일 뉴스 조회
    console.log(`\n2. 단일 뉴스 조회 (ID: ${firstNewsId}):`);
    const singleNews = await newsDBManager.getNewsById(firstNewsId);
    console.log(`제목: ${singleNews.title?.ko || 'N/A'}`);
    console.log(`카테고리: ${singleNews.category || 'N/A'}`);
    console.log(`발행 상태: ${singleNews.isPublished ? '발행됨' : '미발행'}`);
    
    // 특정 제목의 뉴스 검색
    console.log('\n3. 특정 제목의 뉴스 검색:');
    const specialTitles = ['adsfasdf', 'ㅁㅇㄴㄹㅇㄴㅁㄹㅇㄹ', '랄랄라'];
    
    for (const title of specialTitles) {
      const titleResult = await newsDBManager.getNewsByTitle(title);
      console.log(`제목 '${title}'로 검색: ${titleResult.length}개 결과`);
      
      if (titleResult.length > 0) {
        console.log(`- ID: ${titleResult[0]._id}`);
        console.log(`- 슬러그: ${titleResult[0].slug}`);
        console.log(`- 카테고리: ${titleResult[0].category}`);
      }
    }
    
    // 카테고리별 뉴스 조회
    console.log('\n4. 카테고리별 뉴스 조회:');
    const categories = ['company', 'product', 'technology'];
    
    for (const category of categories) {
      const categoryNews = await newsDBManager.getNewsByCategory(category);
      console.log(`카테고리 '${category}': ${categoryNews.length}개 뉴스`);
    }
    
    // 뉴스 통계 조회
    console.log('\n5. 뉴스 통계:');
    const stats = await newsDBManager.getNewsStats();
    console.log(`- 총 뉴스: ${stats.totalCount}개`);
    console.log(`- 발행된 뉴스: ${stats.publishedCount}개`);
    console.log(`- 미발행 뉴스: ${stats.unpublishedCount}개`);
    console.log('- 카테고리별 뉴스 수:');
    stats.categories.forEach((cat) => {
      console.log(`  * ${cat.category}: ${cat.count}개`);
    });
    
    console.log('\n--- 뉴스 DB 관리자 테스트 완료 ---');
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  } finally {
    // 연결 종료
    await newsDBManager.close();
  }
}

// 테스트 실행
runTest(); 