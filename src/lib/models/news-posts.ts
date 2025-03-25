// Company News model
import { v4 as uuidv4 } from 'uuid';

export interface NewsPost {
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
  category: 'company' | 'award' | 'partnership' | 'product'; // News categories
  imageSrc: string; // URL to feature image
  featured?: boolean; // For highlighting important news
}

// Sample company news data
let newsPosts: NewsPost[] = [
  {
    id: '1',
    title: {
      ko: '에코아이티, 한컴그룹과 AI 사업 협력 MOU 체결',
      en: 'Echo IT Signs AI Business Cooperation MOU with Hancom Group'
    },
    slug: 'hancom-ai-partnership',
    date: '2025-03-15',
    excerpt: {
      ko: '에코아이티는 AI 기술 분야에서 한컴그룹과 전략적 파트너십을 체결하여 혁신적인 AI 솔루션을 공동 개발할 예정입니다.',
      en: 'Echo IT has established a strategic partnership with Hancom Group in the field of AI technology to jointly develop innovative AI solutions.'
    },
    content: {
      ko: `에코아이티는 AI 기술 분야에서 한컴그룹과 전략적 파트너십을 체결하여 혁신적인 AI 솔루션을 공동 개발할 예정입니다.

이번 파트너십을 통해 에코아이티는 한컴그룹의 AI 기술과 에코아이티의 IT 서비스 구축 노하우를 결합하여 기업 고객을 위한 지능형 비즈니스 솔루션을 개발할 계획입니다.

양사는 AI 기반 문서 처리 자동화, 자연어 처리 기술을 활용한 고객 서비스 개선, 데이터 분석 솔루션 등 다양한 영역에서 협력할 예정입니다.

에코아이티 CEO는 "이번 한컴그룹과의 협력은 AI 기술을 활용한 비즈니스 혁신을 가속화하는 중요한 계기가 될 것"이라며 "양사의 전문성과 기술력을 결합하여 고객에게 더 나은 가치를 제공하겠다"고 밝혔습니다.`,
      en: `Echo IT has established a strategic partnership with Hancom Group in the field of AI technology to jointly develop innovative AI solutions.

Through this partnership, Echo IT plans to combine Hancom Group's AI technology with Echo IT's IT service implementation expertise to develop intelligent business solutions for corporate customers.

The two companies plan to collaborate in various areas such as AI-based document processing automation, customer service improvement using natural language processing technology, and data analysis solutions.

Echo IT's CEO stated, "This collaboration with Hancom Group will be an important opportunity to accelerate business innovation using AI technology," adding, "We will combine the expertise and technical capabilities of both companies to provide better value to customers."`
    },
    category: 'partnership',
    imageSrc: 'https://images.unsplash.com/photo-1560250056-07ba64664864?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: '2',
    title: {
      ko: '2024 디지털 혁신 어워드 최우수상 수상',
      en: 'Wins 2024 Digital Innovation Award Grand Prize'
    },
    slug: 'digital-innovation-award-2024',
    date: '2025-02-20',
    excerpt: {
      ko: '에코아이티가 금융권 디지털 전환 프로젝트의 성공적 수행을 인정받아 2024 디지털 혁신 어워드에서 최우수상을 수상했습니다.',
      en: 'Echo IT has been awarded the grand prize at the 2024 Digital Innovation Award in recognition of its successful implementation of a digital transformation project in the financial sector.'
    },
    content: {
      ko: `에코아이티가 금융권 디지털 전환 프로젝트의 성공적 수행을 인정받아 2024 디지털 혁신 어워드에서 최우수상을 수상했습니다.

이번 수상은 에코아이티가 국내 주요 금융기관을 위해 구축한 AI 기반 고객 서비스 플랫폼이 디지털 혁신과 사용자 경험 향상에 크게 기여한 점을 높이 평가받은 결과입니다.

해당 프로젝트는 금융 서비스의 접근성을 높이고 고객 상담 처리 시간을 60% 단축하는 성과를 달성했으며, 혁신적인 기술 적용과 안정적인 시스템 구축이 업계의 모범 사례로 꼽히고 있습니다.

에코아이티 프로젝트 책임자는 "이번 수상은 디지털 혁신을 통해 실질적인 비즈니스 가치를 창출하고자 하는 우리의 노력을 인정받은 결과"라며 "앞으로도 고객의 디지털 전환을 성공적으로 지원하기 위해 최선을 다하겠다"고 소감을 전했습니다.`,
      en: `Echo IT has been awarded the grand prize at the 2024 Digital Innovation Award in recognition of its successful implementation of a digital transformation project in the financial sector.

This award is the result of high recognition for Echo IT's AI-based customer service platform built for a major domestic financial institution, which significantly contributed to digital innovation and improved user experience.

The project achieved results of increasing accessibility to financial services and reducing customer consultation processing time by 60%, and its innovative technology application and stable system implementation are considered as best practices in the industry.

Echo IT's project manager stated, "This award is a recognition of our efforts to create real business value through digital innovation," adding, "We will continue to do our best to successfully support our customers' digital transformation."`
    },
    category: 'award',
    imageSrc: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: '3',
    title: {
      ko: '에코아이티, 신규 지사 오픈으로 경영 인프라 확대',
      en: 'Echo IT Expands Management Infrastructure with New Branch Office'
    },
    slug: 'new-branch-office-opening',
    date: '2025-01-25',
    excerpt: {
      ko: '에코아이티가 부산에 신규 지사를 설립하여 지방 고객 지원 강화 및 지역 인재 채용을 확대합니다.',
      en: 'Echo IT establishes a new branch office in Busan to strengthen support for regional customers and expand recruitment of local talent.'
    },
    content: {
      ko: `에코아이티가 부산에 신규 지사를 설립하여 지방 고객 지원 강화 및 지역 인재 채용을 확대합니다.

부산 센텀시티에 위치한 신규 지사는 지역 고객에 대한 더 긴밀한 기술 지원과 서비스를 제공하는 한편, 지역 IT 인재를 적극 채용하여 에코아이티의 기술력을 더욱 강화할 계획입니다.

에코아이티는 이번 지사 설립을 통해 올해 부산 및 경남 지역에서 20여 명의 신규 인력을 채용할 예정이며, 지역 대학과의 산학협력도 확대할 계획입니다.

CEO는 "부산 지사 설립은 지역 균형 발전과 고객 서비스 향상이라는 두 가지 목표를 동시에 달성하기 위한 중요한 투자"라며 "앞으로도 지역 중심의 성장 전략을 지속적으로 추진해 나갈 것"이라고 밝혔습니다.`,
      en: `Echo IT establishes a new branch office in Busan to strengthen support for regional customers and expand recruitment of local talent.

The new branch located in Busan's Centum City plans to provide closer technical support and services to regional customers, while actively recruiting local IT talent to further strengthen Echo IT's technical capabilities.

Through this branch establishment, Echo IT plans to hire 20 new employees in the Busan and South Gyeongsang Province region this year, and to expand industry-academic cooperation with local universities.

The CEO stated, "The establishment of the Busan branch is an important investment to simultaneously achieve the two goals of balanced regional development and customer service improvement," adding, "We will continue to pursue a region-centered growth strategy."`
    },
    category: 'company',
    imageSrc: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: {
      ko: '차세대 AI 기반 비즈니스 인텔리전스 솔루션 출시',
      en: 'Launch of Next-Generation AI-Based Business Intelligence Solution'
    },
    slug: 'ai-business-intelligence-solution',
    date: '2024-12-15',
    excerpt: {
      ko: '에코아이티는 기업의 데이터 기반 의사결정을 지원하는 차세대 AI 비즈니스 인텔리전스 솔루션 "EchoInsight"를 출시했습니다.',
      en: 'Echo IT has launched "EchoInsight", a next-generation AI business intelligence solution that supports data-driven decision making for enterprises.'
    },
    content: {
      ko: `에코아이티는 기업의 데이터 기반 의사결정을 지원하는 차세대 AI 비즈니스 인텔리전스 솔루션 "EchoInsight"를 출시했습니다.

EchoInsight는 기업의 다양한 데이터 소스를 통합하고 AI 기술을 활용하여 실시간 분석과 예측 인사이트를 제공하는 솔루션으로, 직관적인 대시보드와 자연어 질의 기능을 통해 기술 전문가가 아닌 사용자도 쉽게 데이터를 분석할 수 있습니다.

특히 이 솔루션은 SAP, Salesforce 등 주요 기업 시스템과의 원활한 통합을 지원하며, 산업별 특화 모델을 제공하여 금융, 제조, 유통 등 다양한 분야에서 활용할 수 있습니다.

기술 책임자는 "EchoInsight는 기업의 모든 구성원이 데이터의 가치를 최대한 활용할 수 있도록 설계되었다"며 "이를 통해 조직의 데이터 활용 문화를 혁신하고 경쟁력을 강화할 수 있을 것"이라고 설명했습니다.`,
      en: `Echo IT has launched "EchoInsight", a next-generation AI business intelligence solution that supports data-driven decision making for enterprises.

EchoInsight is a solution that integrates various data sources of a company and provides real-time analysis and predictive insights using AI technology. It allows non-technical users to easily analyze data through an intuitive dashboard and natural language query function.

In particular, this solution supports seamless integration with major enterprise systems such as SAP and Salesforce, and provides industry-specific models that can be utilized in various fields such as finance, manufacturing, and distribution.

The CTO explained, "EchoInsight is designed to enable all members of an enterprise to maximize the value of data," adding, "Through this, organizations will be able to innovate their data utilization culture and strengthen their competitiveness."`
    },
    category: 'product',
    imageSrc: 'https://images.unsplash.com/photo-1599658880436-c61792e70672?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: '5',
    title: {
      ko: 'Siemens와 스마트 팩토리 솔루션 파트너십 체결',
      en: 'Smart Factory Solution Partnership with Siemens'
    },
    slug: 'siemens-smart-factory-partnership',
    date: '2024-11-20',
    excerpt: {
      ko: '에코아이티는 제조 산업의 디지털 전환을 위해 Siemens와 스마트 팩토리 솔루션 파트너십을 체결했습니다.',
      en: 'Echo IT has signed a smart factory solution partnership with Siemens for digital transformation in the manufacturing industry.'
    },
    content: {
      ko: `에코아이티는 제조 산업의 디지털 전환을 위해 Siemens와 스마트 팩토리 솔루션 파트너십을 체결했습니다.

이번 파트너십은 Siemens의 산업 자동화 기술과 에코아이티의 IT 시스템 통합 역량을 결합하여 한국 제조 기업을 위한 종합적인 스마트 팩토리 솔루션을 제공하는 것을 목표로 합니다.

양사는 공동으로 산업용 IoT 플랫폼, 생산 관리 시스템, 예측 유지보수 솔루션 등을 개발하고, 국내 제조업체의 디지털 전환을 지원할 계획입니다.

"이번 파트너십은 글로벌 산업 자동화 선도 기업인 Siemens와 국내 IT 서비스 전문 기업인 에코아이티의 강점을 결합한 이상적인 협력 모델"이라며 "이를 통해 국내 제조업의 경쟁력 강화에 기여할 수 있기를 기대한다"고 CEO는 말했습니다.`,
      en: `Echo IT has signed a smart factory solution partnership with Siemens for digital transformation in the manufacturing industry.

This partnership aims to combine Siemens' industrial automation technology with Echo IT's IT system integration capabilities to provide comprehensive smart factory solutions for Korean manufacturing companies.

Together, the two companies plan to develop industrial IoT platforms, production management systems, predictive maintenance solutions, and support the digital transformation of domestic manufacturers.

"This partnership is an ideal cooperation model that combines the strengths of Siemens, a global leader in industrial automation, and Echo IT, a domestic IT service specialist," the CEO said, adding, "We hope to contribute to strengthening the competitiveness of domestic manufacturing through this."`
    },
    category: 'partnership',
    imageSrc: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

// Get recent news posts (most recent first)
export function getRecentNewsPosts(count = 3): NewsPost[] {
  return [...newsPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

// Get featured news posts
export function getFeaturedNewsPosts(): NewsPost[] {
  return newsPosts
    .filter(post => post.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get news post by slug
export function getNewsPostBySlug(slug: string): NewsPost | undefined {
  return newsPosts.find(post => post.slug === slug);
}

// Get news post by ID
export function getNewsPostById(id: string): NewsPost | undefined {
  return newsPosts.find(post => post.id === id);
}

// Get news posts by category
export function getNewsPostsByCategory(category: string): NewsPost[] {
  return newsPosts
    .filter(post => post.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Search news posts (searches in title and excerpt)
export function searchNewsPosts(query: string, language: 'ko' | 'en'): NewsPost[] {
  const searchQuery = query.toLowerCase();
  return newsPosts
    .filter(post =>
      post.title[language].toLowerCase().includes(searchQuery) ||
      post.excerpt[language].toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get all news posts
export function getAllNewsPosts(): NewsPost[] {
  return [...newsPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Create a new news post
export function createNewsPost(post: Omit<NewsPost, 'id'>): NewsPost {
  const newPost: NewsPost = {
    ...post,
    id: uuidv4(),
  };

  newsPosts.push(newPost);
  return newPost;
}

// Update an existing news post
export function updateNewsPost(id: string, updatedPost: Partial<Omit<NewsPost, 'id'>>): NewsPost | undefined {
  const postIndex = newsPosts.findIndex(post => post.id === id);
  if (postIndex === -1) return undefined;

  newsPosts[postIndex] = {
    ...newsPosts[postIndex],
    ...updatedPost,
  };

  return newsPosts[postIndex];
}

// Delete a news post
export function deleteNewsPost(id: string): boolean {
  const initialLength = newsPosts.length;
  newsPosts = newsPosts.filter(post => post.id !== id);

  return newsPosts.length < initialLength;
}

// Create a slug from a title
export function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
}
