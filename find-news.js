const { MongoClient } = require('mongodb');

async function run() {
  try {
    const uri = 'mongodb+srv://echoplanning2:Xksgb135@echoitadmin.mdq2h.mongodb.net/echoit?retryWrites=true&w=majority&appName=ECHOITADMIN';
    const client = new MongoClient(uri);
    
    await client.connect();
    console.log('MongoDB에 연결되었습니다.');
    
    const db = client.db();
    const collection = db.collection('newsposts');
    
    // 모든 뉴스 조회
    const results = await collection.find({}).toArray();
    console.log('총 뉴스 개수:', results.length);
    
    console.log('\n제목 목록:');
    for(let i = 0; i < results.length; i++) {
      const post = results[i];
      console.log(`[${i+1}] ${post.title?.ko || 'N/A'} (ID: ${post._id})`);
    }
    
    // "랄랄라" 같은 제목 검색
    const query = { 
      'title.ko': { $regex: '랄랄라', $options: 'i' } 
    };
    
    const searchResults = await collection.find(query).toArray();
    console.log('\n"랄랄라" 검색 결과:', searchResults.length);
    
    for(let i = 0; i < searchResults.length; i++) {
      const post = searchResults[i];
      console.log(`\n검색결과 ${i+1}:`);
      console.log(`  제목: ${post.title?.ko || 'N/A'}`);
      console.log(`  ID: ${post._id}`);
      console.log(`  슬러그: ${post.slug}`);
      console.log(`  카테고리: ${post.category}`);
    }
    
    await client.close();
    console.log('\n연결이 종료되었습니다.');
  } catch (err) {
    console.error('오류 발생:', err);
  }
}

run(); 