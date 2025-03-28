// ESG post model
import { v4 as uuidv4 } from 'uuid';

export interface ESGPost {
  id: string; // unique identifier
  title: {
    ko: string;
    en: string;
  };
  slug: string; // URL-friendly title
  date: string; // ISO date string format
  excerpt: {
    ko: string;
    en: string;
  };
  content: {
    ko: string;
    en: string;
  };
  category: 'environment' | 'social' | 'governance'; // ESG categories
  imageSrc: string; // URL to feature image
  author: string; // Author of the post
}

// Sample ESG posts data
let esgPosts: ESGPost[] = [
  {
    id: '1',
    title: {
      ko: '에코아이티, 카본 중립 이니셔티브 발표',
      en: 'ECHOIT Announces Carbon Neutrality Initiative'
    },
    slug: 'carbon-neutrality-initiative',
    date: '2025-03-10',
    excerpt: {
      ko: '에코아이티는 2030년까지 탄소 중립을 달성하기 위한 종합적인 친환경 계획을 발표했습니다.',
      en: 'ECHOIT has announced a comprehensive environmental plan to achieve carbon neutrality by 2030.'
    },
    content: {
      ko: `에코아이티는 2030년까지 탄소 중립을 달성하기 위한 종합적인 친환경 계획을 발표했습니다.

이 계획은 재생 에너지 사용 확대, 에너지 효율 향상, 지속 가능한 사무실 운영 등을 포함합니다. 에코아이티는 IT 서비스 제공 과정에서 발생하는 탄소 배출량을 측정하고 단계적으로 감소시킬 예정입니다.

CEO는 "기후 변화는 우리 모두가 직면한 가장 중요한 도전 중 하나이며, 기업으로서 우리는 이에 적극적으로 대응해야 할 책임이 있습니다"라고 밝혔습니다.

에코아이티는 또한 친환경 IT 솔루션을 개발하여 고객들이 비즈니스 운영 과정에서 환경 영향을 최소화할 수 있도록 지원할 예정입니다.`,
      en: `ECHOIT has announced a comprehensive environmental plan to achieve carbon neutrality by 2030.

This plan includes expanding the use of renewable energy, improving energy efficiency, and sustainable office operations. ECHOIT will measure and gradually reduce carbon emissions that occur during the IT service delivery process.

The CEO stated, "Climate change is one of the most important challenges we all face, and as a company, we have a responsibility to actively respond to it."

ECHOIT will also develop eco-friendly IT solutions to help customers minimize their environmental impact during business operations.`
    },
    category: 'environment',
    imageSrc: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: 'ESG 경영팀'
  },
  {
    id: '2',
    title: {
      ko: '지역 사회 IT 교육 지원 프로그램 확대',
      en: 'Expansion of IT Education Support Program for Local Communities'
    },
    slug: 'it-education-support-program',
    date: '2025-02-15',
    excerpt: {
      ko: '에코아이티는 청소년과 취약계층을 위한 IT 교육 지원 프로그램을 확대하여 디지털 포용성을 강화합니다.',
      en: 'ECHOIT strengthens digital inclusion by expanding its IT education support program for youth and vulnerable groups.'
    },
    content: {
      ko: `에코아이티는 청소년과 취약계층을 위한 IT 교육 지원 프로그램을 확대하여 디지털 포용성을 강화하고 있습니다.

이 프로그램은 코딩 교육, 소프트웨어 개발, 디지털 리터러시 등 다양한 IT 역량을 개발할 수 있는 기회를 제공합니다. 특히 농어촌 지역과 도시 취약지역의 청소년들을 위한 맞춤형 교육 과정이 포함되어 있습니다.

에코아이티의 임직원들은 자원봉사자로 참여하여 멘토링과 실무 지도를 제공하고 있으며, 연간 100명 이상의 청소년이 이 프로그램의 혜택을 받을 것으로 예상됩니다.

"우리는 디지털 기술의 혜택이 모든 사람들에게 공평하게 제공되어야 한다고 믿습니다. 이 프로그램을 통해 미래 IT 인재를 육성하고 디지털 격차를 줄이는 데 기여하고자 합니다."라고 사회공헌 담당자는 말했습니다.`,
      en: `ECHOIT is strengthening digital inclusion by expanding its IT education support program for youth and vulnerable groups.

This program provides opportunities to develop various IT capabilities such as coding education, software development, and digital literacy. It includes customized curricula especially for youth in rural areas and vulnerable urban areas.

ECHOIT employees participate as volunteers providing mentoring and practical guidance, and it is expected that more than 100 youth will benefit from this program annually.

"We believe that the benefits of digital technology should be provided equitably to all people. Through this program, we aim to nurture future IT talent and contribute to reducing the digital divide," said the CSR manager.`
    },
    category: 'social',
    imageSrc: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: '사회공헌팀'
  },
  {
    id: '3',
    title: {
      ko: '에코아이티, ESG 경영 위원회 신설',
      en: 'ECHOIT Establishes ESG Management Committee'
    },
    slug: 'esg-management-committee',
    date: '2025-01-20',
    excerpt: {
      ko: '에코아이티는 ESG 경영 강화를 위한 전담 위원회를 신설하여 지속가능한 경영 체계를 구축합니다.',
      en: 'ECHOIT establishes a dedicated committee to strengthen ESG management and build a sustainable management system.'
    },
    content: {
      ko: `에코아이티는 ESG 경영 강화를 위한 전담 위원회를 신설하여 지속가능한 경영 체계를 구축합니다.

새로 설립된 ESG 경영 위원회는 CEO를 포함한 주요 임원진으로 구성되며, 환경 보호, 사회적 책임, 투명한 지배구조 구축을 위한 전략을 수립하고 실행할 예정입니다.

위원회는 분기별로 ESG 성과를 검토하고, 국제 표준에 부합하는 지속가능성 보고서를 연간 발행하여 주요 이해관계자들과 소통할 계획입니다.

"ESG는 기업의 장기적 성공과 사회적 가치 창출을 위한 필수 요소입니다. 우리는 이번 위원회 설립을 통해 ESG를 경영의 핵심 축으로 삼고, 책임 있는 기업 시민으로서의 역할을 다하겠습니다."라고 CEO는 밝혔습니다.`,
      en: `ECHOIT establishes a dedicated committee to strengthen ESG management and build a sustainable management system.

The newly established ESG Management Committee consists of key executives including the CEO, and will develop and implement strategies for environmental protection, social responsibility, and transparent governance.

The committee will review ESG performance quarterly and plans to communicate with key stakeholders by publishing an annual sustainability report that meets international standards.

"ESG is an essential element for the long-term success of companies and the creation of social value. Through the establishment of this committee, we will make ESG a core axis of management and fulfill our role as a responsible corporate citizen," said the CEO.`
    },
    category: 'governance',
    imageSrc: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: 'ESG 경영팀'
  },
  {
    id: '4',
    title: {
      ko: '친환경 클라우드 컴퓨팅 솔루션 출시',
      en: 'Launch of Eco-friendly Cloud Computing Solution'
    },
    slug: 'eco-friendly-cloud-solution',
    date: '2024-12-05',
    excerpt: {
      ko: '에코아이티는 에너지 효율성을 최대화한 새로운 친환경 클라우드 컴퓨팅 솔루션을 출시했습니다.',
      en: 'ECHOIT has launched a new eco-friendly cloud computing solution that maximizes energy efficiency.'
    },
    content: {
      ko: `에코아이티는 에너지 효율성을 최대화한 새로운 친환경 클라우드 컴퓨팅 솔루션을 출시했습니다.

이 솔루션은 최적화된 리소스 할당 기술과 AI 기반 에너지 관리 시스템을 통해 기존 클라우드 서비스 대비 최대 40%의 에너지 절감 효과를 제공합니다.

에코아이티는 재생 에너지로 운영되는 데이터 센터를 활용하여 클라우드 서비스의 탄소 발자국을 최소화하고, 고객 기업들의 친환경 경영을 지원합니다.

"기업들은 디지털 전환과 동시에 환경적 책임을 다해야 하는 도전에 직면해 있습니다. 우리의 친환경 클라우드 솔루션은 이 두 가지 목표를 동시에 달성할 수 있는 혁신적인 방법을 제공합니다."라고 기술 책임자는 설명했습니다.`,
      en: `ECHOIT has launched a new eco-friendly cloud computing solution that maximizes energy efficiency.

This solution provides up to 40% energy savings compared to existing cloud services through optimized resource allocation technology and AI-based energy management systems.

ECHOIT minimizes the carbon footprint of cloud services by utilizing data centers powered by renewable energy, supporting eco-friendly management of client companies.

"Companies face the challenge of simultaneously pursuing digital transformation and fulfilling environmental responsibilities. Our eco-friendly cloud solution provides an innovative way to achieve both of these goals," explained the CTO.`
    },
    category: 'environment',
    imageSrc: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: '기술연구소'
  },
  {
    id: '5',
    title: {
      ko: '임직원 다양성 및 포용성 강화 프로그램 도입',
      en: 'Introduction of Employee Diversity and Inclusion Enhancement Program'
    },
    slug: 'diversity-inclusion-program',
    date: '2024-11-10',
    excerpt: {
      ko: '에코아이티는 기업 내 다양성과 포용성을 강화하기 위한 포괄적인 프로그램을 도입했습니다.',
      en: 'ECHOIT has introduced a comprehensive program to strengthen diversity and inclusion within the company.'
    },
    content: {
      ko: `에코아이티는 기업 내 다양성과 포용성을 강화하기 위한 포괄적인 프로그램을 도입했습니다.

이 프로그램은 다양한 배경을 가진 인재 채용 확대, 리더십 개발 기회 제공, 포용적 기업 문화 조성 등을 포함하며, 모든 임직원이 자신의 잠재력을 발휘할 수 있는 환경을 만드는 것을 목표로 합니다.

에코아이티는 이 프로그램을 통해 2026년까지 여성 리더십 비율을 30% 이상으로 높이고, 다양한 세대와 배경을 가진 인재들의 균형 있는 성장을 지원할 계획입니다.

"다양성은 혁신의 원천이며, 포용적인 문화는 모든 구성원이 최상의 성과를 낼 수 있는 기반입니다. 우리는 이 프로그램을 통해 더 강력하고 창의적인 조직을 구축해 나갈 것입니다."라고 인사 담당 임원은 말했습니다.`,
      en: `ECHOIT has introduced a comprehensive program to strengthen diversity and inclusion within the company.

This program includes expanding recruitment of talent with diverse backgrounds, providing leadership development opportunities, and creating an inclusive corporate culture, with the goal of creating an environment where all employees can reach their potential.

Through this program, ECHOIT plans to increase the proportion of women in leadership to over 30% by 2026 and support the balanced growth of talent from diverse generations and backgrounds.

"Diversity is the source of innovation, and an inclusive culture is the foundation for all members to achieve their best performance. Through this program, we will build a stronger and more creative organization," said the HR executive.`
    },
    category: 'social',
    imageSrc: 'https://images.unsplash.com/photo-1581089778245-3ce67677f718?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: '인사팀'
  },
];

// Get recent posts (most recent first)
export function getRecentESGPosts(count = 3): ESGPost[] {
  return [...esgPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

// Get post by slug
export function getESGPostBySlug(slug: string): ESGPost | undefined {
  return esgPosts.find(post => post.slug === slug);
}

// Get ESG post by ID
export function getESGPostById(id: string): ESGPost | undefined {
  return esgPosts.find(post => post.id === id);
}

// Get posts by category
export function getESGPostsByCategory(category: string): ESGPost[] {
  return esgPosts
    .filter(post => post.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Search posts (searches in title and excerpt)
export function searchESGPosts(query: string, language: 'ko' | 'en'): ESGPost[] {
  const searchQuery = query.toLowerCase();
  return esgPosts
    .filter(post =>
      post.title[language].toLowerCase().includes(searchQuery) ||
      post.excerpt[language].toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get all ESG posts
export function getAllESGPosts(): ESGPost[] {
  return [...esgPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Create a new ESG post
export function createESGPost(post: Omit<ESGPost, 'id'>): ESGPost {
  const newPost: ESGPost = {
    ...post,
    id: uuidv4(),
  };

  esgPosts.push(newPost);
  return newPost;
}

// Update an existing ESG post
export function updateESGPost(id: string, updatedPost: Partial<Omit<ESGPost, 'id'>>): ESGPost | undefined {
  const postIndex = esgPosts.findIndex(post => post.id === id);
  if (postIndex === -1) return undefined;

  esgPosts[postIndex] = {
    ...esgPosts[postIndex],
    ...updatedPost,
  };

  return esgPosts[postIndex];
}

// Delete an ESG post
export function deleteESGPost(id: string): boolean {
  const initialLength = esgPosts.length;
  esgPosts = esgPosts.filter(post => post.id !== id);

  return esgPosts.length < initialLength;
}

// Create a slug from a title
export function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
}
