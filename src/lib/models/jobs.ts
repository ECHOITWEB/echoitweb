// Job listing model

export interface JobListing {
  id: string;
  title: {
    ko: string;
    en: string;
  };
  slug: string;
  department: {
    ko: string;
    en: string;
  };
  location: {
    ko: string;
    en: string;
  };
  type: {
    ko: string;
    en: string;
  }; // Full-time, Contract, etc.
  experience: {
    ko: string;
    en: string;
  }; // Required experience
  deadline: string; // ISO date string
  description: {
    ko: string;
    en: string;
  };
  requirements: {
    ko: string[];
    en: string[];
  };
  benefits: {
    ko: string[];
    en: string[];
  };
  featured?: boolean;
}

// Sample job listings
export const jobListings: JobListing[] = [
  {
    id: '1',
    title: {
      ko: 'SAP ABAP 개발자',
      en: 'SAP ABAP Developer'
    },
    slug: 'sap-abap-developer',
    department: {
      ko: 'SAP 개발팀',
      en: 'SAP Development Team'
    },
    location: {
      ko: '서울 (본사)',
      en: 'Seoul (HQ)'
    },
    type: {
      ko: '정규직',
      en: 'Full-time'
    },
    experience: {
      ko: '3년 이상',
      en: '3+ years'
    },
    deadline: '2025-05-31',
    description: {
      ko: 'SAP ERP 시스템의 개발 및 유지보수를 담당할 ABAP 개발자를 모집합니다. 다양한 산업 분야의 고객사 프로젝트에 참여하여 기업의 비즈니스 프로세스를 최적화하는 중요한 역할을 수행하게 됩니다.',
      en: 'We are looking for an ABAP developer to be responsible for the development and maintenance of SAP ERP systems. You will play an important role in optimizing business processes by participating in customer projects across various industries.'
    },
    requirements: {
      ko: [
        'SAP ABAP 개발 경험 3년 이상',
        'ABAP OO, ALV, BAPI, BDC, LSMW, ALE/IDOC 등 개발 경험',
        'SAP Module(MM, SD, FI, PP 등) 중 1개 이상 구축 경험',
        '대규모 프로젝트 수행 경험(우대)',
        'SAP S/4HANA 구축 경험(우대)'
      ],
      en: [
        'At least 3 years of experience in SAP ABAP development',
        'Development experience with ABAP OO, ALV, BAPI, BDC, LSMW, ALE/IDOC, etc.',
        'Implementation experience in at least one SAP Module (MM, SD, FI, PP, etc.)',
        'Experience in large-scale projects (preferred)',
        'SAP S/4HANA implementation experience (preferred)'
      ]
    },
    benefits: {
      ko: [
        '경쟁력 있는 급여 및 성과 보너스',
        '4대 보험 및 퇴직연금',
        '유연근무제 및 자율출퇴근',
        '명절/생일/경조사 지원',
        '교육비 및 자격증 취득 지원',
        '건강검진 및 단체보험 가입'
      ],
      en: [
        'Competitive salary and performance bonuses',
        'Four major insurances and retirement pension',
        'Flexible working hours',
        'Support for holidays/birthdays/family events',
        'Support for education and certification',
        'Health check-ups and group insurance'
      ]
    },
    featured: true
  },
  {
    id: '2',
    title: {
      ko: 'RPA 개발자',
      en: 'RPA Developer'
    },
    slug: 'rpa-developer',
    department: {
      ko: 'AI/RPA팀',
      en: 'AI/RPA Team'
    },
    location: {
      ko: '서울 (본사)',
      en: 'Seoul (HQ)'
    },
    type: {
      ko: '정규직',
      en: 'Full-time'
    },
    experience: {
      ko: '2년 이상',
      en: '2+ years'
    },
    deadline: '2025-04-30',
    description: {
      ko: '비즈니스 프로세스 자동화를 위한 RPA 솔루션 개발자를 모집합니다. 고객사의 업무 프로세스를 분석하고 UiPath, Brity RPA 등을 활용하여 자동화 솔루션을 설계 및 구현하게 됩니다.',
      en: 'We are recruiting RPA solution developers for business process automation. You will analyze customer business processes and design and implement automation solutions using UiPath, Brity RPA, etc.'
    },
    requirements: {
      ko: [
        'RPA 개발 경험 2년 이상',
        'UiPath, Brity RPA 개발 경험',
        '프로세스 분석 및 자동화 설계 경험',
        'SQL 및 데이터베이스에 대한 이해',
        '금융, 제조 등 산업별 프로세스 이해(우대)'
      ],
      en: [
        'At least 2 years of experience in RPA development',
        'Development experience with UiPath, Brity RPA',
        'Experience in process analysis and automation design',
        'Understanding of SQL and databases',
        'Understanding of industry-specific processes such as finance, manufacturing, etc. (preferred)'
      ]
    },
    benefits: {
      ko: [
        '경쟁력 있는 급여 및 성과 보너스',
        '4대 보험 및 퇴직연금',
        '유연근무제 및 자율출퇴근',
        '명절/생일/경조사 지원',
        '교육비 및 자격증 취득 지원',
        '건강검진 및 단체보험 가입'
      ],
      en: [
        'Competitive salary and performance bonuses',
        'Four major insurances and retirement pension',
        'Flexible working hours',
        'Support for holidays/birthdays/family events',
        'Support for education and certification',
        'Health check-ups and group insurance'
      ]
    },
    featured: true
  },
  {
    id: '3',
    title: {
      ko: '프론트엔드 개발자 (React)',
      en: 'Frontend Developer (React)'
    },
    slug: 'frontend-developer-react',
    department: {
      ko: '웹개발팀',
      en: 'Web Development Team'
    },
    location: {
      ko: '서울 (본사)',
      en: 'Seoul (HQ)'
    },
    type: {
      ko: '정규직',
      en: 'Full-time'
    },
    experience: {
      ko: '2년 이상',
      en: '2+ years'
    },
    deadline: '2025-05-15',
    description: {
      ko: '기업용 웹 애플리케이션 개발을 위한 프론트엔드 개발자를 모집합니다. React를 활용하여 사용자 중심의 인터페이스를 구현하고, 백엔드 개발자와 협업하여 완성도 높은 웹 애플리케이션을 개발하게 됩니다.',
      en: 'We are recruiting a frontend developer for enterprise web application development. You will implement user-centered interfaces using React and collaborate with backend developers to develop high-quality web applications.'
    },
    requirements: {
      ko: [
        'React 개발 경험 2년 이상',
        'HTML, CSS, JavaScript/TypeScript 능숙',
        'RESTful API와의 통신 경험',
        '반응형 웹 개발 경험',
        'Next.js, Redux 활용 경험(우대)',
        '웹 성능 최적화 경험(우대)'
      ],
      en: [
        'At least 2 years of experience in React development',
        'Proficient in HTML, CSS, JavaScript/TypeScript',
        'Experience in communication with RESTful APIs',
        'Experience in responsive web development',
        'Experience with Next.js, Redux (preferred)',
        'Experience in web performance optimization (preferred)'
      ]
    },
    benefits: {
      ko: [
        '경쟁력 있는 급여 및 성과 보너스',
        '4대 보험 및 퇴직연금',
        '유연근무제 및 자율출퇴근',
        '명절/생일/경조사 지원',
        '교육비 및 자격증 취득 지원',
        '건강검진 및 단체보험 가입'
      ],
      en: [
        'Competitive salary and performance bonuses',
        'Four major insurances and retirement pension',
        'Flexible working hours',
        'Support for holidays/birthdays/family events',
        'Support for education and certification',
        'Health check-ups and group insurance'
      ]
    }
  },
  {
    id: '4',
    title: {
      ko: '백엔드 개발자 (Java/Spring)',
      en: 'Backend Developer (Java/Spring)'
    },
    slug: 'backend-developer-java-spring',
    department: {
      ko: '웹개발팀',
      en: 'Web Development Team'
    },
    location: {
      ko: '서울 (본사)',
      en: 'Seoul (HQ)'
    },
    type: {
      ko: '정규직',
      en: 'Full-time'
    },
    experience: {
      ko: '3년 이상',
      en: '3+ years'
    },
    deadline: '2025-05-15',
    description: {
      ko: '기업용 웹 애플리케이션의 백엔드 개발을 담당할 개발자를 모집합니다. Java/Spring을 활용하여 안정적이고 확장 가능한 서버 사이드 애플리케이션을 개발하게 됩니다.',
      en: 'We are recruiting a developer to be responsible for the backend development of enterprise web applications. You will develop stable and scalable server-side applications using Java/Spring.'
    },
    requirements: {
      ko: [
        'Java/Spring 개발 경험 3년 이상',
        'RESTful API 설계 및 구현 경험',
        'MySQL, Oracle 등 관계형 데이터베이스 활용 경험',
        '대용량 트래픽 처리 경험',
        'MSA(Microservice Architecture) 경험(우대)',
        'AWS, Docker, Kubernetes 등 클라우드 환경 경험(우대)'
      ],
      en: [
        'At least 3 years of experience in Java/Spring development',
        'Experience in designing and implementing RESTful APIs',
        'Experience with relational databases such as MySQL, Oracle',
        'Experience in handling high-volume traffic',
        'Experience with MSA (Microservice Architecture) (preferred)',
        'Experience with cloud environments such as AWS, Docker, Kubernetes (preferred)'
      ]
    },
    benefits: {
      ko: [
        '경쟁력 있는 급여 및 성과 보너스',
        '4대 보험 및 퇴직연금',
        '유연근무제 및 자율출퇴근',
        '명절/생일/경조사 지원',
        '교육비 및 자격증 취득 지원',
        '건강검진 및 단체보험 가입'
      ],
      en: [
        'Competitive salary and performance bonuses',
        'Four major insurances and retirement pension',
        'Flexible working hours',
        'Support for holidays/birthdays/family events',
        'Support for education and certification',
        'Health check-ups and group insurance'
      ]
    }
  },
  {
    id: '5',
    title: {
      ko: 'Mendix 개발자',
      en: 'Mendix Developer'
    },
    slug: 'mendix-developer',
    department: {
      ko: 'Low-Code 개발팀',
      en: 'Low-Code Development Team'
    },
    location: {
      ko: '서울 (본사)',
      en: 'Seoul (HQ)'
    },
    type: {
      ko: '정규직',
      en: 'Full-time'
    },
    experience: {
      ko: '1년 이상',
      en: '1+ years'
    },
    deadline: '2025-06-15',
    description: {
      ko: 'Mendix 로우코드 플랫폼을 활용한 애플리케이션 개발자를 모집합니다. 비즈니스 요구사항을 신속하게 구현하고, 고객의 디지털 전환을 가속화하는 역할을 수행하게 됩니다.',
      en: 'We are recruiting application developers using the Mendix low-code platform. You will quickly implement business requirements and play a role in accelerating customers\' digital transformation.'
    },
    requirements: {
      ko: [
        'Mendix 개발 경험 1년 이상 또는 관련 IT 개발 경험 2년 이상',
        'Java, JavaScript 등 프로그래밍 언어 이해',
        '관계형 데이터베이스 및 SQL 이해',
        'UI/UX 설계 경험',
        'Mendix 인증(우대)',
        '애자일 방법론 경험(우대)'
      ],
      en: [
        'At least 1 year of experience in Mendix development or at least 2 years of related IT development experience',
        'Understanding of programming languages such as Java, JavaScript',
        'Understanding of relational databases and SQL',
        'Experience in UI/UX design',
        'Mendix certification (preferred)',
        'Experience with Agile methodology (preferred)'
      ]
    },
    benefits: {
      ko: [
        '경쟁력 있는 급여 및 성과 보너스',
        '4대 보험 및 퇴직연금',
        '유연근무제 및 자율출퇴근',
        '명절/생일/경조사 지원',
        '교육비 및 자격증 취득 지원',
        '건강검진 및 단체보험 가입'
      ],
      en: [
        'Competitive salary and performance bonuses',
        'Four major insurances and retirement pension',
        'Flexible working hours',
        'Support for holidays/birthdays/family events',
        'Support for education and certification',
        'Health check-ups and group insurance'
      ]
    },
    featured: true
  }
]

// Get all job listings sorted by featured first, then by deadline
export function getAllJobs(): JobListing[] {
  return [...jobListings].sort((a, b) => {
    // First, sort by featured flag
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    // Then, sort by deadline (closest deadline first)
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

// Get featured job listings
export function getFeaturedJobs(): JobListing[] {
  return jobListings.filter(job => job.featured);
}

// Get job by slug
export function getJobBySlug(slug: string): JobListing | undefined {
  return jobListings.find(job => job.slug === slug);
}

// Search jobs by title and description
export function searchJobs(query: string, language: 'ko' | 'en'): JobListing[] {
  const searchQuery = query.toLowerCase();
  return jobListings
    .filter(job =>
      job.title[language].toLowerCase().includes(searchQuery) ||
      job.description[language].toLowerCase().includes(searchQuery) ||
      job.department[language].toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
}
