// 더미 ESG 데이터를 MongoDB로 마이그레이션하는 스크립트
import { connectToDatabase } from '@/lib/db/connect';
import ESGPostModel from '@/lib/db/models/ESGPost';
import { ESGCategory, AuthorDepartment } from '@/types/esg';
import { fileURLToPath } from 'url';
import path from 'path';

// ES Module에서 현재 파일이 메인 모듈인지 확인하는 방법
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

// 더미 ESG 데이터 (src/lib/models/esg-posts.ts에서 가져옴)
const dummyESGPosts = [
  {
    id: '1',
    title: {
      ko: '에코아이티, 탄소중립 경영 선언',
      en: 'ECHOIT Declares Carbon Neutral Management'
    },
    slug: 'carbon-neutral-management',
    date: '2025-03-10',
    excerpt: {
      ko: '에코아이티가 2030년까지 탄소중립 달성을 위한 ESG 경영 비전을 선포하고, 친환경 IT 인프라 구축을 약속했습니다.',
      en: 'ECHOIT has announced an ESG management vision to achieve carbon neutrality by 2030 and has promised to build eco-friendly IT infrastructure.'
    },
    content: {
      ko: `에코아이티가 2030년까지 탄소중립 달성을 위한 ESG 경영 비전을 선포하고, 친환경 IT 인프라 구축을 약속했습니다.

이번 선언에서 에코아이티는 2025년까지 사내 에너지 사용량의 50%를 재생에너지로 전환하고, 2030년까지 탄소 배출량을 넷제로(Net-Zero)로 만들겠다는 목표를 발표했습니다.

회사는 이를 위해 데이터센터의 에너지 효율성 개선, 하이브리드 근무 환경 구축을 통한 통근 탄소 감축, IT 장비의 친환경 소재 사용 확대 등 다양한 이니셔티브를 추진할 계획입니다.

에코아이티 CEO는 "IT 기업으로서 기술의 혁신뿐만 아니라 환경적 책임을 다하는 것이 우리의 사명"이라며 "탄소중립 달성을 통해 지속가능한 미래를 위한 IT 산업의 변화를 선도하겠다"고 밝혔습니다.`,
      en: `ECHOIT has announced an ESG management vision to achieve carbon neutrality by 2030 and has promised to build eco-friendly IT infrastructure.

In this declaration, ECHOIT announced goals to convert 50% of internal energy consumption to renewable energy by 2025 and to make carbon emissions net-zero by 2030.

The company plans to pursue various initiatives to achieve this, including improving the energy efficiency of data centers, reducing commuting carbon through hybrid working environments, and expanding the use of eco-friendly materials in IT equipment.

The CEO of ECHOIT stated, "As an IT company, not only innovation in technology but also fulfilling environmental responsibilities is our mission," adding, "Through achieving carbon neutrality, we will lead the change in the IT industry for a sustainable future."`
    },
    category: 'environment',
    imageSrc: 'https://images.unsplash.com/photo-1569511166193-531c3e6ac073?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: 'ESG 경영팀'
  },
  {
    id: '2',
    title: {
      ko: 'IT 인재 양성을 위한 장학금 프로그램 확대',
      en: 'Expansion of Scholarship Program for IT Talent Development'
    },
    slug: 'it-scholarship-program',
    date: '2025-02-15',
    excerpt: {
      ko: '에코아이티가 사회공헌활동의 일환으로 IT 분야 인재 양성을 위한 장학금 프로그램을 확대하여 올해 50명의 대학생에게 지원을 제공합니다.',
      en: 'ECHOIT expands its scholarship program for IT talent development as part of its social contribution activities, providing support to 50 university students this year.'
    },
    content: {
      ko: `에코아이티가 사회공헌활동의 일환으로 IT 분야 인재 양성을 위한 장학금 프로그램을 확대하여 올해 50명의 대학생에게 지원을 제공합니다.

'에코아이티 테크 스칼라십'으로 명명된 이 프로그램은 컴퓨터공학, 소프트웨어 개발, 인공지능 등 IT 관련 전공 학생들에게 등록금과 학습 지원금을 제공하며, 특히 경제적 여건이 어려운 학생들과 여성 공학도를 우선 지원합니다.

장학생들은 금전적 지원 외에도 에코아이티의 현직 엔지니어들과의 멘토링, 인턴십 기회, 산학 프로젝트 참여 등 다양한 혜택을 받게 됩니다.

CSR 담당 임원은 "인재 양성은 IT 기업의 사회적 책임이자 산업의 지속가능성을 위한 투자"라며 "앞으로도 다양한 교육 프로그램을 통해 디지털 격차 해소와 IT 생태계 발전에 기여하겠다"고 전했습니다.`,
      en: `ECHOIT expands its scholarship program for IT talent development as part of its social contribution activities, providing support to 50 university students this year.

Named 'ECHOIT Tech Scholarship', this program provides tuition and learning support funds to students majoring in IT-related fields such as computer engineering, software development, and artificial intelligence, with priority given to economically disadvantaged students and female engineering students.

In addition to financial support, scholarship recipients will receive various benefits such as mentoring with current ECHOIT engineers, internship opportunities, and participation in industry-academic projects.

The CSR executive stated, "Talent development is both a social responsibility of IT companies and an investment for the sustainability of the industry," adding, "We will continue to contribute to reducing the digital divide and developing the IT ecosystem through various educational programs."`
    },
    category: 'social',
    imageSrc: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: '사회공헌팀'
  },
  {
    id: '3',
    title: {
      ko: '지속가능한 공급망 관리 체계 구축',
      en: 'Establishment of Sustainable Supply Chain Management System'
    },
    slug: 'sustainable-supply-chain',
    date: '2025-01-20',
    excerpt: {
      ko: '에코아이티가 협력업체의 환경, 사회적 책임, 윤리경영 수준을 평가하고 지원하는 지속가능한 공급망 관리 체계를 구축했습니다.',
      en: 'ECHOIT has established a sustainable supply chain management system that evaluates and supports the environmental, social responsibility, and ethical management level of its partners.'
    },
    content: {
      ko: `에코아이티가 협력업체의 환경, 사회적 책임, 윤리경영 수준을 평가하고 지원하는 지속가능한 공급망 관리 체계를 구축했습니다.

새로운 공급망 관리 체계는 모든 협력업체를 대상으로 ESG 평가를 실시하고, 이를 기반으로 협력 관계를 수립하는 것을 핵심으로 합니다. 평가 항목에는 온실가스 배출량, 에너지 사용 효율성, 인권 및 노동 환경, 투명한 경영구조 등이 포함됩니다.

에코아이티는 평가 결과에 따라 협력업체의 ESG 역량 강화를 위한 교육 프로그램과 컨설팅을 제공하고, 우수 업체에 대해서는 인센티브를 부여하는 방식으로 지속가능한 비즈니스 생태계를 조성할 계획입니다.

구매 담당 이사는 "진정한 ESG 경영은 우리 회사뿐 아니라 전체 가치 사슬에서 실현되어야 한다"며 "협력업체와 함께 성장하며 환경과 사회에 긍정적인 영향을 미치는 기업이 되겠다"는 의지를 표명했습니다.`,
      en: `ECHOIT has established a sustainable supply chain management system that evaluates and supports the environmental, social responsibility, and ethical management level of its partners.

The new supply chain management system is centered on conducting ESG evaluations for all partners and establishing cooperative relationships based on these evaluations. Assessment items include greenhouse gas emissions, energy use efficiency, human rights and labor environment, and transparent management structure.

ECHOIT plans to create a sustainable business ecosystem by providing education programs and consulting to strengthen ESG capabilities of partners based on evaluation results, and by giving incentives to excellent companies.

The procurement director expressed the commitment, saying, "True ESG management must be realized throughout the entire value chain, not just our company," adding, "We will become a company that grows with our partners and has a positive impact on the environment and society."`
    },
    category: 'governance',
    imageSrc: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: '구매팀'
  },
  {
    id: '4',
    title: {
      ko: '다양성과 포용성 강화를 위한 프로그램 도입',
      en: 'Introduction of Program to Strengthen Diversity and Inclusion'
    },
    slug: 'diversity-inclusion-program',
    date: '2024-12-10',
    excerpt: {
      ko: '에코아이티가 회사 내 다양성과 포용성을 강화하기 위한 종합적인 프로그램을 도입했습니다.',
      en: 'ECHOIT has introduced a comprehensive program to strengthen diversity and inclusion within the company.'
    },
    content: {
      ko: `에코아이티가 회사 내 다양성과 포용성을 강화하기 위한 종합적인 프로그램을 도입했습니다.

이 프로그램은 다양한 배경을 가진 인재의 채용 확대, 리더십 개발 기회 제공, 포용적 기업 문화 조성 등을 포함하며, 모든 구성원이 잠재력을 발휘할 수 있는 환경을 만드는 것을 목표로 합니다.

에코아이티는 이 프로그램을 통해 2026년까지 리더십 직위의 여성 비율을 30% 이상으로 늘리고, 다양한 세대와 배경을 가진 인재들의 균형 있는 성장을 지원할 계획입니다.

인사 담당 임원은 "다양성은 혁신의 원천이며, 포용적인 문화는 모든 구성원이 최고의 성과를 달성하기 위한 기반"이라며 "이 프로그램을 통해 더 강하고 창의적인 조직을 구축해 나갈 것"이라고 말했습니다.`,
      en: `ECHOIT has introduced a comprehensive program to strengthen diversity and inclusion within the company.

This program includes expanding recruitment of talent with diverse backgrounds, providing leadership development opportunities, and creating an inclusive corporate culture, with the goal of creating an environment where all employees can reach their potential.

Through this program, ECHOIT plans to increase the proportion of women in leadership to over 30% by 2026 and support the balanced growth of talent from diverse generations and backgrounds.

"Diversity is the source of innovation, and an inclusive culture is the foundation for all members to achieve their best performance. Through this program, we will build a stronger and more creative organization," said the HR executive.`
    },
    category: 'social',
    imageSrc: 'https://images.unsplash.com/photo-1581089778245-3ce67677f718?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: '인사팀'
  },
  {
    id: '5',
    title: {
      ko: '지속가능성 보고서 발간 및 ESG 위원회 신설',
      en: 'Publication of Sustainability Report and Establishment of ESG Committee'
    },
    slug: 'sustainability-report-esg-committee',
    date: '2024-11-15',
    excerpt: {
      ko: '에코아이티가 첫 지속가능성 보고서를 발간하고 이사회 내 ESG 위원회를 신설하여 체계적인 ESG 경영을 위한 거버넌스를 강화했습니다.',
      en: 'ECHOIT has published its first sustainability report and established an ESG committee within the board to strengthen governance for systematic ESG management.'
    },
    content: {
      ko: `에코아이티가 첫 지속가능성 보고서를 발간하고 이사회 내 ESG 위원회를 신설하여 체계적인 ESG 경영을 위한 거버넌스를 강화했습니다.

지속가능성 보고서는 회사의 환경, 사회, 거버넌스 영역에서의 성과와 목표를 투명하게 공개하고, 이해관계자와의 소통을 강화하기 위해 GRI(Global Reporting Initiative) 기준에 따라 작성되었습니다.

새롭게 설립된 ESG 위원회는 사외이사가 과반수를 차지하는 구조로, ESG 전략 수립, 주요 이니셔티브 검토, 성과 평가 등 회사의 지속가능경영 활동을 감독하는 역할을 담당하게 됩니다.

CEO는 "이번 보고서 발간과 위원회 설립은 ESG 경영에 대한 우리의 의지를 공고히 하는 중요한 이정표"라며 "앞으로도 높은 투명성과 책임감을 바탕으로 모든 이해관계자에게 신뢰받는 기업이 되겠다"고 밝혔습니다.`,
      en: `ECHOIT has published its first sustainability report and established an ESG committee within the board to strengthen governance for systematic ESG management.

The sustainability report was prepared according to GRI (Global Reporting Initiative) standards to transparently disclose the company's performance and goals in the areas of environment, society, and governance, and to strengthen communication with stakeholders.

The newly established ESG committee has a structure where outside directors hold a majority, and will be responsible for overseeing the company's sustainable management activities, such as establishing ESG strategies, reviewing major initiatives, and evaluating performance.

The CEO stated, "The publication of this report and the establishment of the committee are important milestones that solidify our commitment to ESG management," adding, "We will continue to be a trusted company for all stakeholders based on high transparency and responsibility."`
    },
    category: 'governance',
    imageSrc: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: 'ESG 경영팀'
  }
];

// 마이그레이션 함수
export async function migrateESGPosts() {
  try {
    // DB 연결
    console.log('데이터베이스 연결 중...');
    await connectToDatabase();
    console.log('데이터베이스 연결 성공!');

    // 기존 데이터 확인
    const existingCount = await ESGPostModel.countDocuments();
    console.log(`기존 ESG 게시물 수: ${existingCount}`);

    // 중복 방지를 위한 슬러그 확인
    console.log('기존 슬러그 확인 중...');
    const existingSlugs = new Set(
      (await ESGPostModel.find({}, { slug: 1 })).map(post => post.slug)
    );
    console.log(`기존 슬러그 수: ${existingSlugs.size}`);

    // 데이터 변환 및 저장
    const convertedPosts = [];
    const failedPosts = [];

    for (const dummyPost of dummyESGPosts) {
      try {
        // 슬러그 중복 확인
        if (existingSlugs.has(dummyPost.slug)) {
          console.log(`중복 슬러그 발견, 건너뜀: ${dummyPost.slug}`);
          continue;
        }

        // 카테고리 매핑
        let category;
        switch (dummyPost.category) {
          case 'environment':
            category = ESGCategory.ENVIRONMENT;
            break;
          case 'social':
            category = ESGCategory.SOCIAL;
            break;
          case 'governance':
            category = ESGCategory.GOVERNANCE;
            break;
          default:
            category = ESGCategory.ESG_MANAGEMENT;
        }

        // 작성자 부서 매핑
        let department;
        switch (dummyPost.author) {
          case 'ESG 경영팀':
            department = AuthorDepartment.ESG;
            break;
          case '사회공헌팀':
            department = AuthorDepartment.CSR;
            break;
          case '인사팀':
            department = AuthorDepartment.HR;
            break;
          default:
            department = AuthorDepartment.ADMIN;
        }

        // MongoDB 형식으로 변환
        const newPost = {
          title: dummyPost.title,
          summary: dummyPost.excerpt, // 기존 excerpt는 summary로 사용
          content: dummyPost.content,
          category,
          author: {
            department,
            name: dummyPost.author || '관리자'
          },
          publishDate: new Date(dummyPost.date),
          imageSource: dummyPost.imageSrc,
          thumbnailUrl: dummyPost.imageSrc, // 호환성
          viewCount: Math.floor(Math.random() * 100), // 랜덤 조회수
          isPublished: true,
          isMainFeatured: Math.random() > 0.5, // 50% 확률로 메인 노출
          slug: dummyPost.slug,
          tags: ['ESG', category, dummyPost.author] // 기본 태그
        };

        // MongoDB에 저장
        const savedPost = await ESGPostModel.create(newPost);
        console.log(`ESG 게시물 저장 성공: ${savedPost.slug}`);
        convertedPosts.push(savedPost._id);
      } catch (error) {
        console.error(`게시물 변환 중 오류 발생: ${dummyPost.slug}`, error);
        failedPosts.push(dummyPost.slug);
      }
    }

    // 결과 보고
    console.log('\n=== 마이그레이션 결과 ===');
    console.log(`총 더미 데이터: ${dummyESGPosts.length}`);
    console.log(`성공적으로 변환된 게시물: ${convertedPosts.length}`);
    console.log(`실패한 게시물: ${failedPosts.length}`);
    
    if (failedPosts.length > 0) {
      console.log('실패한 게시물 목록:', failedPosts);
    }
    
    // 최종 데이터 확인
    const finalCount = await ESGPostModel.countDocuments();
    console.log(`최종 ESG 게시물 수: ${finalCount}`);

    return {
      success: true,
      converted: convertedPosts.length,
      failed: failedPosts,
      total: finalCount
    };
  } catch (error) {
    console.error('ESG 게시물 마이그레이션 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// 스크립트가 직접 실행될 때만 마이그레이션 수행
if (isMainModule) {
  console.log('ESG 더미 데이터 마이그레이션 시작...');
  migrateESGPosts()
    .then(result => {
      console.log('마이그레이션 완료:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('마이그레이션 실패:', error);
      process.exit(1);
    });
} 