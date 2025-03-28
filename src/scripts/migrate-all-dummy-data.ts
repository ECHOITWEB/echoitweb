// 모든 더미 데이터를 마이그레이션하는 스크립트
import { migrateNewsPosts } from './migrate-dummy-news';
import { migrateESGPosts } from './migrate-dummy-esg';
import { fileURLToPath } from 'url';

// ES Module에서 현재 파일이 메인 모듈인지 확인하는 방법
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

async function migrateAllDummyData() {
  console.log('=== 모든 더미 데이터 마이그레이션 시작 ===\n');
  
  // 1. 뉴스 데이터 마이그레이션
  console.log('1. 뉴스 데이터 마이그레이션 시작');
  try {
    const newsResult = await migrateNewsPosts();
    console.log('뉴스 데이터 마이그레이션 결과:', newsResult);
  } catch (error) {
    console.error('뉴스 데이터 마이그레이션 실패:', error);
  }
  
  console.log('\n----------------------------\n');
  
  // 2. ESG 데이터 마이그레이션
  console.log('2. ESG 데이터 마이그레이션 시작');
  try {
    const esgResult = await migrateESGPosts();
    console.log('ESG 데이터 마이그레이션 결과:', esgResult);
  } catch (error) {
    console.error('ESG 데이터 마이그레이션 실패:', error);
  }
  
  console.log('\n=== 마이그레이션 완료 ===');
}

// 스크립트 실행
if (isMainModule) {
  migrateAllDummyData()
    .then(() => {
      console.log('모든 더미 데이터 마이그레이션이 완료되었습니다.');
      process.exit(0);
    })
    .catch(error => {
      console.error('마이그레이션 중 오류 발생:', error);
      process.exit(1);
    });
} 