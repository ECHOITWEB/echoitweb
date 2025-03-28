(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_67b20738._.js", {

"[project]/src/lib/models/esg-posts.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, d: __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// ESG post model
__turbopack_context__.s({
    "createESGPost": (()=>createESGPost),
    "createSlugFromTitle": (()=>createSlugFromTitle),
    "deleteESGPost": (()=>deleteESGPost),
    "getAllESGPosts": (()=>getAllESGPosts),
    "getESGPostById": (()=>getESGPostById),
    "getESGPostBySlug": (()=>getESGPostBySlug),
    "getESGPostsByCategory": (()=>getESGPostsByCategory),
    "getRecentESGPosts": (()=>getRecentESGPosts),
    "searchESGPosts": (()=>searchESGPosts),
    "updateESGPost": (()=>updateESGPost)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$browser$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist/esm-browser/v4.js [app-client] (ecmascript) <export default as v4>");
;
// Sample ESG posts data
let esgPosts = [
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
    }
];
function getRecentESGPosts(count = 3) {
    return [
        ...esgPosts
    ].sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, count);
}
function getESGPostBySlug(slug) {
    return esgPosts.find((post)=>post.slug === slug);
}
function getESGPostById(id) {
    return esgPosts.find((post)=>post.id === id);
}
function getESGPostsByCategory(category) {
    return esgPosts.filter((post)=>post.category === category).sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime());
}
function searchESGPosts(query, language) {
    const searchQuery = query.toLowerCase();
    return esgPosts.filter((post)=>post.title[language].toLowerCase().includes(searchQuery) || post.excerpt[language].toLowerCase().includes(searchQuery)).sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime());
}
function getAllESGPosts() {
    return [
        ...esgPosts
    ].sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime());
}
function createESGPost(post) {
    const newPost = {
        ...post,
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$browser$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])()
    };
    esgPosts.push(newPost);
    return newPost;
}
function updateESGPost(id, updatedPost) {
    const postIndex = esgPosts.findIndex((post)=>post.id === id);
    if (postIndex === -1) return undefined;
    esgPosts[postIndex] = {
        ...esgPosts[postIndex],
        ...updatedPost
    };
    return esgPosts[postIndex];
}
function deleteESGPost(id) {
    const initialLength = esgPosts.length;
    esgPosts = esgPosts.filter((post)=>post.id !== id);
    return esgPosts.length < initialLength;
}
function createSlugFromTitle(title) {
    return title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/admin/esg/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, d: __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>AdminESGPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$esg$2d$posts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/models/esg-posts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$locale$2f$ko$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/locale/ko.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-plus.js [app-client] (ecmascript) <export default as PlusCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-pen.js [app-client] (ecmascript) <export default as Edit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function AdminESGPage() {
    _s();
    const [posts, setPosts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [successMessage, setSuccessMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [errorMessage, setErrorMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminESGPage.useEffect": ()=>{
            loadPosts();
        }
    }["AdminESGPage.useEffect"], []);
    const loadPosts = ()=>{
        const allPosts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$esg$2d$posts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllESGPosts"])();
        setPosts(allPosts);
    };
    const handleDelete = (id)=>{
        if (window.confirm('이 ESG 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            try {
                const success = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$esg$2d$posts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteESGPost"])(id);
                if (success) {
                    setSuccessMessage('ESG 포스트가 성공적으로 삭제되었습니다.');
                    loadPosts();
                } else {
                    setErrorMessage('ESG 포스트 삭제 중 오류가 발생했습니다.');
                }
            } catch (error) {
                setErrorMessage('ESG 포스트 삭제 중 오류가 발생했습니다.');
                console.error(error);
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold",
                        children: "ESG 관리"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/esg/page.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/admin/esg/create",
                        className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__["PlusCircle"], {
                                className: "w-4 h-4 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/esg/page.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            "새 ESG 게시물 작성"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/esg/page.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/esg/page.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            successMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-green-50 p-4 rounded-md text-green-700 mb-4 flex items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                        className: "w-5 h-5 mr-2"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/esg/page.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this),
                    successMessage
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/esg/page.tsx",
                lineNumber: 56,
                columnNumber: 9
            }, this),
            errorMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-red-50 p-4 rounded-md text-red-700 mb-4 flex items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        className: "w-5 h-5 mr-2"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/esg/page.tsx",
                        lineNumber: 64,
                        columnNumber: 11
                    }, this),
                    errorMessage
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/esg/page.tsx",
                lineNumber: 63,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-md shadow-sm overflow-hidden",
                children: posts.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "overflow-x-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "min-w-full divide-y divide-gray-200",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                className: "bg-gray-50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            scope: "col",
                                            className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "이미지"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/esg/page.tsx",
                                            lineNumber: 75,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            scope: "col",
                                            className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "제목"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/esg/page.tsx",
                                            lineNumber: 78,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            scope: "col",
                                            className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "날짜"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/esg/page.tsx",
                                            lineNumber: 81,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            scope: "col",
                                            className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "카테고리"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/esg/page.tsx",
                                            lineNumber: 84,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            scope: "col",
                                            className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "작성자"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/esg/page.tsx",
                                            lineNumber: 87,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            scope: "col",
                                            className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "작업"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/esg/page.tsx",
                                            lineNumber: 90,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/esg/page.tsx",
                                    lineNumber: 74,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/esg/page.tsx",
                                lineNumber: 73,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                className: "bg-white divide-y divide-gray-200",
                                children: posts.map((post)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "hover:bg-gray-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative h-14 w-24 bg-gray-100 rounded overflow-hidden",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        src: post.imageSrc,
                                                        alt: post.title.ko,
                                                        fill: true,
                                                        style: {
                                                            objectFit: 'cover'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/esg/page.tsx",
                                                        lineNumber: 100,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/esg/page.tsx",
                                                    lineNumber: 99,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/esg/page.tsx",
                                                lineNumber: 98,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm font-medium text-gray-900",
                                                        children: post.title.ko
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/esg/page.tsx",
                                                        lineNumber: 109,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-gray-500",
                                                        children: post.title.en
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/esg/page.tsx",
                                                        lineNumber: 110,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/esg/page.tsx",
                                                lineNumber: 108,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(post.date), 'yyyy년 MM월 dd일', {
                                                    locale: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$locale$2f$ko$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ko"]
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/esg/page.tsx",
                                                lineNumber: 112,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${post.category === 'environment' ? 'bg-green-100 text-green-800' : ''}
                        ${post.category === 'social' ? 'bg-blue-100 text-blue-800' : ''}
                        ${post.category === 'governance' ? 'bg-purple-100 text-purple-800' : ''}
                      `,
                                                    children: [
                                                        post.category === 'environment' && '환경',
                                                        post.category === 'social' && '사회',
                                                        post.category === 'governance' && '지배구조'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/esg/page.tsx",
                                                    lineNumber: 116,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/esg/page.tsx",
                                                lineNumber: 115,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
                                                children: post.author
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/esg/page.tsx",
                                                lineNumber: 126,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-6 py-4 whitespace-nowrap text-sm font-medium",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex space-x-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: `/admin/esg/edit/${post.id}`,
                                                            className: "text-blue-600 hover:text-blue-900",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                                    className: "w-5 h-5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/esg/page.tsx",
                                                                    lineNumber: 135,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "sr-only",
                                                                    children: "편집"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/esg/page.tsx",
                                                                    lineNumber: 136,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/esg/page.tsx",
                                                            lineNumber: 131,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>handleDelete(post.id),
                                                            className: "text-red-600 hover:text-red-900",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                    className: "w-5 h-5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/esg/page.tsx",
                                                                    lineNumber: 142,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "sr-only",
                                                                    children: "삭제"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/esg/page.tsx",
                                                                    lineNumber: 143,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/esg/page.tsx",
                                                            lineNumber: 138,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/esg/page.tsx",
                                                    lineNumber: 130,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/esg/page.tsx",
                                                lineNumber: 129,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, post.id, true, {
                                        fileName: "[project]/src/app/admin/esg/page.tsx",
                                        lineNumber: 97,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/esg/page.tsx",
                                lineNumber: 95,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/esg/page.tsx",
                        lineNumber: 72,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/esg/page.tsx",
                    lineNumber: 71,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-8 text-center text-gray-500",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "등록된 ESG 게시물이 없습니다. 새 ESG 게시물을 작성해보세요."
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/esg/page.tsx",
                        lineNumber: 154,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/esg/page.tsx",
                    lineNumber: 153,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/esg/page.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/admin/esg/page.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_s(AdminESGPage, "wbLR9JZ0uGY2x97iJ+v2g5eExtI=");
_c = AdminESGPage;
var _c;
__turbopack_context__.k.register(_c, "AdminESGPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_67b20738._.js.map