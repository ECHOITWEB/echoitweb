/**
 * MongoDB Atlas 직접 연결 테스트 스크립트
 */

const mongoose = require('mongoose');

// MongoDB 연결 URI (비밀번호를 직접 포함)
const MONGODB_URI = 'mongodb+srv://echoitplanning1:Xksgb135@echoitadmin.mdq2h.mongodb.net/echoit?retryWrites=true&w=majority&appName=ECHOITADMIN';

// MongoDB 연결 옵션
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function testConnection() {
  console.log('MongoDB Atlas 연결 테스트를 시작합니다...');

  try {
    // MongoDB에 연결
    await mongoose.connect(MONGODB_URI, options);

    console.log('✅ MongoDB Atlas에 성공적으로 연결되었습니다!');

    // 테스트 문서 생성
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });

    const TestModel = mongoose.models.TestConnection || mongoose.model('TestConnection', testSchema);

    // 테스트 문서 저장
    const testDoc = new TestModel({ name: 'Atlas 직접 연결 테스트' });
    await testDoc.save();

    console.log('✅ 테스트 문서가 성공적으로 저장되었습니다.');

    // 저장된 문서 조회
    const savedDocs = await TestModel.find();
    console.log(`📝 저장된 테스트 문서: ${savedDocs.length}개`);

    // 마지막으로 저장된 문서 출력
    const lastDoc = savedDocs[savedDocs.length - 1];
    console.log(` - 최근 문서: ${lastDoc.name} (${lastDoc.createdAt.toISOString()})`);

    console.log('\n🎉 축하합니다! MongoDB Atlas가 정상적으로 연결되었습니다.');

  } catch (error) {
    console.error('❌ MongoDB Atlas 연결 실패:', error.message);

    if (error.message.includes('Authentication failed')) {
      console.error('\n🔐 인증 오류가 발생했습니다.');
      console.error('MongoDB Atlas에 설정한 사용자 이름과 비밀번호를 확인해 주세요.');
    } else if (error.message.includes('connection timed out')) {
      console.error('\n⏱ 연결 시간이 초과되었습니다.');
      console.error('네트워크 설정을 확인하거나 MongoDB Atlas의 IP 액세스 목록에 현재 IP를 추가해 주세요.');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('\n🌐 호스트를 찾을 수 없습니다.');
      console.error('MongoDB 연결 문자열의 형식이 올바른지 확인해 주세요.');
    }
  } finally {
    // 연결 종료
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB 연결이 종료되었습니다.');
    }
  }
}

// 테스트 실행
testConnection();
