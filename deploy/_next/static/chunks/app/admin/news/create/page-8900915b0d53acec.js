(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[461],{2540:(e,t,n)=>{Promise.resolve().then(n.bind(n,5486))},5486:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>d});var a=n(5155),i=n(2115),s=n(6046),o=n(1116),r=n(5516),l=n(1680);let c=[{value:"company",label:"회사소식"},{value:"award",label:"수상"},{value:"partnership",label:"파트너십"},{value:"product",label:"제품"}];function d(){let e=(0,s.useRouter)(),[t,n]=(0,i.useState)({titleKo:"",titleEn:"",excerptKo:"",excerptEn:"",contentKo:"",contentEn:"",category:"company",imageSrc:"",featured:!1}),[d,h]=(0,i.useState)(""),[m,u]=(0,i.useState)(!1),p=e=>{let{name:a,value:i,type:s}=e.target;n({...t,[a]:"checkbox"===s?e.target.checked:i})},g=(e,a,i)=>{n({...t,["content".concat("ko"===i?"Ko":"En")]:e})},b=async n=>{n.preventDefault(),u(!0),h("");try{if(!t.titleKo||!t.titleEn||!t.excerptKo||!t.excerptEn||!t.contentKo||!t.contentEn||!t.imageSrc){h("모든 필수 필드를 입력해주세요."),u(!1);return}let n=(0,r.At)(t.titleKo),a=new Date().toISOString().split("T")[0];(0,r.oJ)({title:{ko:t.titleKo,en:t.titleEn},slug:n,date:a,excerpt:{ko:t.excerptKo,en:t.excerptEn},content:{ko:t.contentKo,en:t.contentEn},category:t.category,imageSrc:t.imageSrc,featured:t.featured}),e.push("/admin/news")}catch(e){console.error("Error creating news:",e),h("뉴스를 생성하는 중 오류가 발생했습니다.")}finally{u(!1)}};return(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsxs)("div",{className:"flex items-center justify-between",children:[(0,a.jsx)("h1",{className:"text-2xl font-bold",children:"새 뉴스 작성"}),(0,a.jsx)("button",{type:"button",onClick:()=>e.push("/admin/news"),className:"px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50",children:"취소"})]}),d&&(0,a.jsxs)("div",{className:"bg-red-50 p-4 rounded-md text-red-700 mb-4 flex items-center",children:[(0,a.jsx)(l.A,{className:"w-5 h-5 mr-2"}),d]}),(0,a.jsxs)("form",{onSubmit:b,className:"space-y-8",children:[(0,a.jsxs)("div",{className:"bg-white p-6 rounded-md shadow-sm space-y-6",children:[(0,a.jsx)("h2",{className:"text-lg font-semibold border-b pb-2",children:"기본 정보"}),(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)("label",{htmlFor:"titleKo",className:"block text-sm font-medium text-gray-700 mb-1",children:["제목 (한국어) ",(0,a.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,a.jsx)("input",{type:"text",id:"titleKo",name:"titleKo",className:"w-full p-2 border border-gray-300 rounded-md",value:t.titleKo,onChange:p,required:!0})]}),(0,a.jsxs)("div",{children:[(0,a.jsxs)("label",{htmlFor:"titleEn",className:"block text-sm font-medium text-gray-700 mb-1",children:["제목 (영어) ",(0,a.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,a.jsx)("input",{type:"text",id:"titleEn",name:"titleEn",className:"w-full p-2 border border-gray-300 rounded-md",value:t.titleEn,onChange:p,required:!0})]})]}),(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)("label",{htmlFor:"excerptKo",className:"block text-sm font-medium text-gray-700 mb-1",children:["요약 (한국어) ",(0,a.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,a.jsx)("textarea",{id:"excerptKo",name:"excerptKo",rows:3,className:"w-full p-2 border border-gray-300 rounded-md",value:t.excerptKo,onChange:p,required:!0})]}),(0,a.jsxs)("div",{children:[(0,a.jsxs)("label",{htmlFor:"excerptEn",className:"block text-sm font-medium text-gray-700 mb-1",children:["요약 (영어) ",(0,a.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,a.jsx)("textarea",{id:"excerptEn",name:"excerptEn",rows:3,className:"w-full p-2 border border-gray-300 rounded-md",value:t.excerptEn,onChange:p,required:!0})]})]}),(0,a.jsxs)("div",{children:[(0,a.jsxs)("label",{htmlFor:"imageSrc",className:"block text-sm font-medium text-gray-700 mb-1",children:["이미지 URL ",(0,a.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,a.jsx)("input",{type:"text",id:"imageSrc",name:"imageSrc",className:"w-full p-2 border border-gray-300 rounded-md",value:t.imageSrc,onChange:p,placeholder:"https://example.com/image.jpg",required:!0}),(0,a.jsx)("p",{className:"text-xs text-gray-500 mt-1",children:"이미지 URL을 입력하세요. 권장 크기: 800 x 450 픽셀"})]}),(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{htmlFor:"category",className:"block text-sm font-medium text-gray-700 mb-1",children:"카테고리"}),(0,a.jsx)("select",{id:"category",name:"category",className:"w-full p-2 border border-gray-300 rounded-md",value:t.category,onChange:p,children:c.map(e=>(0,a.jsx)("option",{value:e.value,children:e.label},e.value))})]}),(0,a.jsxs)("div",{className:"flex items-center h-full pt-6",children:[(0,a.jsx)("input",{type:"checkbox",id:"featured",name:"featured",className:"h-4 w-4 text-blue-600 border-gray-300 rounded",checked:t.featured,onChange:p}),(0,a.jsx)("label",{htmlFor:"featured",className:"ml-2 block text-sm text-gray-700",children:"주요 뉴스로 표시"})]})]})]}),(0,a.jsxs)("div",{className:"bg-white p-6 rounded-md shadow-sm space-y-6",children:[(0,a.jsx)("h2",{className:"text-lg font-semibold border-b pb-2",children:"본문 내용"}),(0,a.jsxs)("div",{children:[(0,a.jsxs)("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["한국어 본문 ",(0,a.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,a.jsx)(o.K,{apiKey:"no-api-key",initialValue:"",init:{height:400,menubar:!1,plugins:["advlist","autolink","lists","link","image","charmap","preview","anchor","searchreplace","visualblocks","code","fullscreen","insertdatetime","media","table","code","help","wordcount"],toolbar:"undo redo | formatselect | bold italic backcolor |                   alignleft aligncenter alignright alignjustify |                   bullist numlist outdent indent | removeformat | help"},onEditorChange:(e,t)=>g(e,t,"ko")})]}),(0,a.jsxs)("div",{children:[(0,a.jsxs)("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["영어 본문 ",(0,a.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,a.jsx)(o.K,{apiKey:"no-api-key",initialValue:"",init:{height:400,menubar:!1,plugins:["advlist","autolink","lists","link","image","charmap","preview","anchor","searchreplace","visualblocks","code","fullscreen","insertdatetime","media","table","code","help","wordcount"],toolbar:"undo redo | formatselect | bold italic backcolor |                   alignleft aligncenter alignright alignjustify |                   bullist numlist outdent indent | removeformat | help"},onEditorChange:(e,t)=>g(e,t,"en")})]})]}),(0,a.jsx)("div",{className:"flex justify-end",children:(0,a.jsx)("button",{type:"submit",disabled:m,className:"px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",children:m?"저장 중...":"저장"})})]})]})}},5516:(e,t,n)=>{"use strict";n.d(t,{$h:()=>l,AI:()=>s,At:()=>m,De:()=>h,Gb:()=>r,U9:()=>c,oJ:()=>d,x2:()=>o});var a=n(9749);let i=[{id:"1",title:{ko:"에코아이티, 한컴그룹과 AI 사업 협력 MOU 체결",en:"ECHOIT Signs AI Business Cooperation MOU with Hancom Group"},slug:"hancom-ai-partnership",date:"2025-03-15",excerpt:{ko:"에코아이티는 AI 기술 분야에서 한컴그룹과 전략적 파트너십을 체결하여 혁신적인 AI 솔루션을 공동 개발할 예정입니다.",en:"ECHOIT has established a strategic partnership with Hancom Group in the field of AI technology to jointly develop innovative AI solutions."},content:{ko:'에코아이티는 AI 기술 분야에서 한컴그룹과 전략적 파트너십을 체결하여 혁신적인 AI 솔루션을 공동 개발할 예정입니다.\n\n이번 파트너십을 통해 에코아이티는 한컴그룹의 AI 기술과 에코아이티의 IT 서비스 구축 노하우를 결합하여 기업 고객을 위한 지능형 비즈니스 솔루션을 개발할 계획입니다.\n\n양사는 AI 기반 문서 처리 자동화, 자연어 처리 기술을 활용한 고객 서비스 개선, 데이터 분석 솔루션 등 다양한 영역에서 협력할 예정입니다.\n\n에코아이티 CEO는 "이번 한컴그룹과의 협력은 AI 기술을 활용한 비즈니스 혁신을 가속화하는 중요한 계기가 될 것"이라며 "양사의 전문성과 기술력을 결합하여 고객에게 더 나은 가치를 제공하겠다"고 밝혔습니다.',en:'ECHOIT has established a strategic partnership with Hancom Group in the field of AI technology to jointly develop innovative AI solutions.\n\nThrough this partnership, ECHOIT plans to combine Hancom Group\'s AI technology with ECHOIT\'s IT service implementation expertise to develop intelligent business solutions for corporate customers.\n\nThe two companies plan to collaborate in various areas such as AI-based document processing automation, customer service improvement using natural language processing technology, and data analysis solutions.\n\nECHOIT\'s CEO stated, "This collaboration with Hancom Group will be an important opportunity to accelerate business innovation using AI technology," adding, "We will combine the expertise and technical capabilities of both companies to provide better value to customers."'},category:"partnership",imageSrc:"https://images.unsplash.com/photo-1560250056-07ba64664864?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",featured:!0},{id:"2",title:{ko:"2024 디지털 혁신 어워드 최우수상 수상",en:"Wins 2024 Digital Innovation Award Grand Prize"},slug:"digital-innovation-award-2024",date:"2025-02-20",excerpt:{ko:"에코아이티가 금융권 디지털 전환 프로젝트의 성공적 수행을 인정받아 2024 디지털 혁신 어워드에서 최우수상을 수상했습니다.",en:"ECHOIT has been awarded the grand prize at the 2024 Digital Innovation Award in recognition of its successful implementation of a digital transformation project in the financial sector."},content:{ko:'에코아이티가 금융권 디지털 전환 프로젝트의 성공적 수행을 인정받아 2024 디지털 혁신 어워드에서 최우수상을 수상했습니다.\n\n이번 수상은 에코아이티가 국내 주요 금융기관을 위해 구축한 AI 기반 고객 서비스 플랫폼이 디지털 혁신과 사용자 경험 향상에 크게 기여한 점을 높이 평가받은 결과입니다.\n\n해당 프로젝트는 금융 서비스의 접근성을 높이고 고객 상담 처리 시간을 60% 단축하는 성과를 달성했으며, 혁신적인 기술 적용과 안정적인 시스템 구축이 업계의 모범 사례로 꼽히고 있습니다.\n\n에코아이티 프로젝트 책임자는 "이번 수상은 디지털 혁신을 통해 실질적인 비즈니스 가치를 창출하고자 하는 우리의 노력을 인정받은 결과"라며 "앞으로도 고객의 디지털 전환을 성공적으로 지원하기 위해 최선을 다하겠다"고 소감을 전했습니다.',en:'ECHOIT has been awarded the grand prize at the 2024 Digital Innovation Award in recognition of its successful implementation of a digital transformation project in the financial sector.\n\nThis award is the result of high recognition for ECHOIT\'s AI-based customer service platform built for a major domestic financial institution, which significantly contributed to digital innovation and improved user experience.\n\nThe project achieved results of increasing accessibility to financial services and reducing customer consultation processing time by 60%, and its innovative technology application and stable system implementation are considered as best practices in the industry.\n\nECHOIT\'s project manager stated, "This award is a recognition of our efforts to create real business value through digital innovation," adding, "We will continue to do our best to successfully support our customers\' digital transformation."'},category:"award",imageSrc:"https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",featured:!0},{id:"3",title:{ko:"에코아이티, 신규 지사 오픈으로 경영 인프라 확대",en:"ECHOIT Expands Management Infrastructure with New Branch Office"},slug:"new-branch-office-opening",date:"2025-01-25",excerpt:{ko:"에코아이티가 부산에 신규 지사를 설립하여 지방 고객 지원 강화 및 지역 인재 채용을 확대합니다.",en:"ECHOIT establishes a new branch office in Busan to strengthen support for regional customers and expand recruitment of local talent."},content:{ko:'에코아이티가 부산에 신규 지사를 설립하여 지방 고객 지원 강화 및 지역 인재 채용을 확대합니다.\n\n부산 센텀시티에 위치한 신규 지사는 지역 고객에 대한 더 긴밀한 기술 지원과 서비스를 제공하는 한편, 지역 IT 인재를 적극 채용하여 에코아이티의 기술력을 더욱 강화할 계획입니다.\n\n에코아이티는 이번 지사 설립을 통해 올해 부산 및 경남 지역에서 20여 명의 신규 인력을 채용할 예정이며, 지역 대학과의 산학협력도 확대할 계획입니다.\n\nCEO는 "부산 지사 설립은 지역 균형 발전과 고객 서비스 향상이라는 두 가지 목표를 동시에 달성하기 위한 중요한 투자"라며 "앞으로도 지역 중심의 성장 전략을 지속적으로 추진해 나갈 것"이라고 밝혔습니다.',en:'ECHOIT establishes a new branch office in Busan to strengthen support for regional customers and expand recruitment of local talent.\n\nThe new branch located in Busan\'s Centum City plans to provide closer technical support and services to regional customers, while actively recruiting local IT talent to further strengthen ECHOIT\'s technical capabilities.\n\nThrough this branch establishment, ECHOIT plans to hire 20 new employees in the Busan and South Gyeongsang Province region this year, and to expand industry-academic cooperation with local universities.\n\nThe CEO stated, "The establishment of the Busan branch is an important investment to simultaneously achieve the two goals of balanced regional development and customer service improvement," adding, "We will continue to pursue a region-centered growth strategy."'},category:"company",imageSrc:"https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},{id:"4",title:{ko:"차세대 AI 기반 비즈니스 인텔리전스 솔루션 출시",en:"Launch of Next-Generation AI-Based Business Intelligence Solution"},slug:"ai-business-intelligence-solution",date:"2024-12-15",excerpt:{ko:'에코아이티는 기업의 데이터 기반 의사결정을 지원하는 차세대 AI 비즈니스 인텔리전스 솔루션 "EchoInsight"를 출시했습니다.',en:'ECHOIT has launched "EchoInsight", a next-generation AI business intelligence solution that supports data-driven decision making for enterprises.'},content:{ko:'에코아이티는 기업의 데이터 기반 의사결정을 지원하는 차세대 AI 비즈니스 인텔리전스 솔루션 "EchoInsight"를 출시했습니다.\n\nEchoInsight는 기업의 다양한 데이터 소스를 통합하고 AI 기술을 활용하여 실시간 분석과 예측 인사이트를 제공하는 솔루션으로, 직관적인 대시보드와 자연어 질의 기능을 통해 기술 전문가가 아닌 사용자도 쉽게 데이터를 분석할 수 있습니다.\n\n특히 이 솔루션은 SAP, Salesforce 등 주요 기업 시스템과의 원활한 통합을 지원하며, 산업별 특화 모델을 제공하여 금융, 제조, 유통 등 다양한 분야에서 활용할 수 있습니다.\n\n기술 책임자는 "EchoInsight는 기업의 모든 구성원이 데이터의 가치를 최대한 활용할 수 있도록 설계되었다"며 "이를 통해 조직의 데이터 활용 문화를 혁신하고 경쟁력을 강화할 수 있을 것"이라고 설명했습니다.',en:'ECHOIT has launched "EchoInsight", a next-generation AI business intelligence solution that supports data-driven decision making for enterprises.\n\nEchoInsight is a solution that integrates various data sources of a company and provides real-time analysis and predictive insights using AI technology. It allows non-technical users to easily analyze data through an intuitive dashboard and natural language query function.\n\nIn particular, this solution supports seamless integration with major enterprise systems such as SAP and Salesforce, and provides industry-specific models that can be utilized in various fields such as finance, manufacturing, and distribution.\n\nThe CTO explained, "EchoInsight is designed to enable all members of an enterprise to maximize the value of data," adding, "Through this, organizations will be able to innovate their data utilization culture and strengthen their competitiveness."'},category:"product",imageSrc:"https://images.unsplash.com/photo-1599658880436-c61792e70672?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",featured:!0},{id:"5",title:{ko:"Siemens와 스마트 팩토리 솔루션 파트너십 체결",en:"Smart Factory Solution Partnership with Siemens"},slug:"siemens-smart-factory-partnership",date:"2024-11-20",excerpt:{ko:"에코아이티는 제조 산업의 디지털 전환을 위해 Siemens와 스마트 팩토리 솔루션 파트너십을 체결했습니다.",en:"ECHOIT has signed a smart factory solution partnership with Siemens for digital transformation in the manufacturing industry."},content:{ko:'에코아이티는 제조 산업의 디지털 전환을 위해 Siemens와 스마트 팩토리 솔루션 파트너십을 체결했습니다.\n\n이번 파트너십은 Siemens의 산업 자동화 기술과 에코아이티의 IT 시스템 통합 역량을 결합하여 한국 제조 기업을 위한 종합적인 스마트 팩토리 솔루션을 제공하는 것을 목표로 합니다.\n\n양사는 공동으로 산업용 IoT 플랫폼, 생산 관리 시스템, 예측 유지보수 솔루션 등을 개발하고, 국내 제조업체의 디지털 전환을 지원할 계획입니다.\n\n"이번 파트너십은 글로벌 산업 자동화 선도 기업인 Siemens와 국내 IT 서비스 전문 기업인 에코아이티의 강점을 결합한 이상적인 협력 모델"이라며 "이를 통해 국내 제조업의 경쟁력 강화에 기여할 수 있기를 기대한다"고 CEO는 말했습니다.',en:'ECHOIT has signed a smart factory solution partnership with Siemens for digital transformation in the manufacturing industry.\n\nThis partnership aims to combine Siemens\' industrial automation technology with ECHOIT\'s IT system integration capabilities to provide comprehensive smart factory solutions for Korean manufacturing companies.\n\nTogether, the two companies plan to develop industrial IoT platforms, production management systems, predictive maintenance solutions, and support the digital transformation of domestic manufacturers.\n\n"This partnership is an ideal cooperation model that combines the strengths of Siemens, a global leader in industrial automation, and ECHOIT, a domestic IT service specialist," the CEO said, adding, "We hope to contribute to strengthening the competitiveness of domestic manufacturing through this."'},category:"partnership",imageSrc:"https://images.unsplash.com/photo-1581092160607-ee22621dd758?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}];function s(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:3;return[...i].sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime()).slice(0,e)}function o(){return i.filter(e=>e.featured).sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime())}function r(e){return i.filter(t=>t.category===e).sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime())}function l(e,t){let n=e.toLowerCase();return i.filter(e=>e.title[t].toLowerCase().includes(n)||e.excerpt[t].toLowerCase().includes(n)).sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime())}function c(){return[...i].sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime())}function d(e){let t={...e,id:(0,a.A)()};return i.push(t),t}function h(e){let t=i.length;return(i=i.filter(t=>t.id!==e)).length<t}function m(e){return e.toLowerCase().replace(/[^\w\s]/g,"").replace(/\s+/g,"-")}}},e=>{var t=t=>e(e.s=t);e.O(0,[830,441,587,358],()=>t(2540)),_N_E=e.O()}]);