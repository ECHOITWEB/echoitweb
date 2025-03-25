/**
 * MongoDB Atlas 연결 테스트 스크립트
 *
 * 사용법:
 * 1. .env.local 파일에 MongoDB Atlas 연결 문자열을 설정합니다.
 * 2. 연결 문자열의 <db_password> 부분을 실제 비밀번호로 교체합니다.
 * 3. 터미널에서 `node scripts/test-mongodb-atlas.js`를 실행합니다.
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// .env.local 파일 직접 읽기
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');

      envLines.forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            if (value) {
              process.env[key.trim()] = value;
            }
          }
        }
      });

      console.log('✅ .env.local 파일을 성공적으로 로드했습니다.');
    } else {
      console.error('❌ .env.local 파일을 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('❌ .env.local 파일 로드 중 오류:', error.message);
  }
}

// 환경 변수 로드
loadEnv();

// MongoDB 연결 URI
let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MongoDB 연결 문자열이 .env.local 파일에 설정되지 않았습니다.');
  console.error('MongoDB Atlas 계정을 생성하고 연결 문자열을 .env.local 파일에 설정해 주세요.');
  process.exit(1);
}

console.log('MongoDB URI:', MONGODB_URI);

// 비밀번호 체크
if (MONGODB_URI.includes('<db_password>')) {
  console.error('❌ MongoDB 연결 문자열에 아직 <db_password> 플레이스홀더가 있습니다.');
  console.error('연결 문자열의 <db_password> 부분을 실제 비밀번호로 교체하세요.');
  console.error('\n.env.local 파일을 다음과 같이 수정하세요:');
  console.error('MONGODB_URI=mongodb+srv://echoitplanning1:실제비밀번호@echoitadmin.mdq2h.mongodb.net/echoit?retryWrites=true&w=majority&appName=ECHOITADMIN');
  process.exit(1);
}

// 데이터베이스 이름 확인 및 추가
if (!MONGODB_URI.includes('/echoit?') && !MONGODB_URI.includes('/echoit/')) {
  // '/echoit?' 또는 '/echoit/' 패턴이 없는 경우 데이터베이스 이름 추가
  MONGODB_URI = MONGODB_URI.replace('/?', '/echoit?');
}

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

    try {
      // 데이터베이스 정보 출력
      const adminDb = mongoose.connection.db.admin();
      const serverInfo = await adminDb.serverStatus();

      console.log('📊 서버 정보:');
      console.log(` - MongoDB 버전: ${serverInfo.version}`);
      console.log(` - 연결 시간: ${new Date().toISOString()}`);
    } catch (error) {
      console.log('⚠️ 서버 정보를 가져올 수 없습니다. 제한된 권한으로 인해 발생할 수 있는 정상적인 상황입니다.');
    }

    // 컬렉션 목록 가져오기
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();

      console.log('📁 데이터베이스 컬렉션:');
      if (collections.length === 0) {
        console.log(' - 아직 컬렉션이 없습니다. 첫 번째 데이터를 추가해 보세요!');
      } else {
        collections.forEach(collection => {
          console.log(` - ${collection.name}`);
        });
      }
    } catch (error) {
      console.log('⚠️ 컬렉션 목록을 가져올 수 없습니다. 제한된 권한으로 인해 발생할 수 있는 정상적인 상황입니다.');
    }

    // 테스트 문서 생성
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });

    const TestModel = mongoose.models.TestConnection || mongoose.model('TestConnection', testSchema);

    // 테스트 문서 저장
    const testDoc = new TestModel({ name: 'Atlas 연결 테스트' });
    await testDoc.save();

    console.log('✅ 테스트 문서가 성공적으로 저장되었습니다.');

    // 저장된 문서 조회
    const savedDocs = await TestModel.find();
    console.log(`📝 저장된 테스트 문서: ${savedDocs.length}개`);

    // 마지막으로 저장된 문서 출력
    const lastDoc = savedDocs[savedDocs.length - 1];
    console.log(` - 최근 문서: ${lastDoc.name} (${lastDoc.createdAt.toISOString()})`);

    console.log('\n🎉 축하합니다! MongoDB Atlas가 정상적으로 구성되었습니다.');
    console.log('이제 애플리케이션을 실행하고 데이터베이스 기능을 사용할 수 있습니다.');

  } catch (error) {
    console.error('❌ MongoDB Atlas 연결 실패:', error.message);

    if (error.message.includes('Authentication failed')) {
      console.error('\n🔐 인증 오류가 발생했습니다.');
      console.error('MongoDB Atlas에 설정한 사용자 이름과 비밀번호를 확인해 주세요.');
      console.error('연결 문자열의 <db_password> 부분을 실제 비밀번호로 교체했는지 확인하세요.');
    } else if (error.message.includes('connection timed out')) {
      console.error('\n⏱ 연결 시간이 초과되었습니다.');
      console.error('네트워크 설정을 확인하거나 MongoDB Atlas의 IP 액세스 목록에 현재 IP를 추가해 주세요.');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('\n🌐 호스트를 찾을 수 없습니다.');
      console.error('MongoDB 연결 문자열의 형식이 올바른지 확인해 주세요.');
    }

    console.error('\n📋 문제 해결 방법:');
    console.error('1. .env.local 파일의 MONGODB_URI가 올바른지 확인하세요.');
    console.error('2. MongoDB Atlas의 Network Access 설정에서 현재 IP가 허용되어 있는지 확인하세요.');
    console.error('3. MongoDB Atlas의 Database Access에서 사용자 이름과 비밀번호가 올바른지 확인하세요.');
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
