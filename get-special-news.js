const { MongoClient } = require('mongodb');

async function run() {
  try {
    const uri = 'mongodb+srv://echoplanning2:Xksgb135@echoitadmin.mdq2h.mongodb.net/echoit?retryWrites=true&w=majority&appName=ECHOITADMIN';
    const client = new MongoClient(uri);
    
    await client.connect();
    console.log('MongoDB에 연결되었습니다.');
    
    const db = client.db();
    const collection = db.collection('newsposts');
    
    // 특정 제목의 뉴스 검색
    const query = { 
      'title.ko': { 
        $in: ['adsfasdf', 'ㅁㅇㄴㄹㅇㄴㅁㄹㅇㄹ', '랄랄라'] 
      } 
    };
    
    const specialNews = await collection.find(query).toArray();
    console.log('특수 뉴스 검색 결과:', specialNews.length);
    
    console.log('\n특수 뉴스 목록:');
    for(let i = 0; i < specialNews.length; i++) {
      const post = specialNews[i];
      console.log(`\n뉴스 ${i+1}: ${post.title.ko}`);
      console.log(`  ID: ${post._id}`);
      console.log(`  슬러그: ${post.slug}`);
      console.log(`  카테고리: ${post.category}`);
      console.log(`  발행일: ${post.publishDate}`);
      console.log(`  내용 일부: ${post.content.ko.substring(0, 100)}...`);
    }
    
    // 추가 정보: 관리자 페이지 접근 방법
    console.log('\n관리자 페이지에서 이 뉴스들을 보려면:');
    console.log('1. /admin/news 페이지로 이동');
    console.log('2. 각 뉴스 ID를 이용해 접근: /admin/news/edit/[뉴스 ID]\n');
    
    await client.close();
    console.log('연결이 종료되었습니다.');
  } catch (err) {
    console.error('오류 발생:', err);
  }
}

run(); 