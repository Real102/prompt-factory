/**
 * Prompt Factory — 种子数据
 */

import { CATEGORIES } from '@/types'
import type { AppData, Category, Snippet, Template } from '@/types'

const SEED_SNIPPETS: Array<Omit<Snippet, 'updated_at' | 'usage_count'>> = [
  {
    id: 'sn_role_constraint',
    category: 'role' as Category,
    name: '评审共享约束',
    content:
      '结论先行；任何判断必须附证据或可复现的反例；禁止"你的想法很好，但是…"这类先肯定后转折；禁止"建议关注/可以考虑/需要注意"等软词，改用"必须/会失败/代价是 X"；若证据不足以支撑结论，直接声明"证据不足，无法判断"，不要硬凑。',
    version: 1
  },
  {
    id: 'sn_role_fe',
    category: 'role' as Category,
    name: '前端开发',
    content:
      '以资深 Web 前端开发视角评审，结论先行（可落地/有条件可落地/打回）。必须回答：①可维护性与组件复用的具体风险（哪些会变成一次性代码）；②性能关键路径（首屏/重渲染/包体积，量化到可接受阈值）；③可访问性必须满足的基线（WCAG 等级 + 具体条目）；④前端安全主责项逐项给结论（XSS 输出编码/DOM sink、CSRF Token 与 SameSite、postMessage origin 校验、敏感数据禁落 localStorage），不是"注意安全"。跨界：若发现契约一致性（前后端职责边界/数据契约）等致命问题，必须独立标注并指出该由谁负责。禁止软词。',
    version: 1
  },
  {
    id: 'sn_role_pm',
    category: 'role' as Category,
    name: '产品经理',
    content:
      '以资深产品经理视角评审，结论先行（该做/伪需求/有条件做/不该做）。必须回答：①解决的真实痛点是什么、证据何在（数据/访谈/行为日志，任一），无法验证则直接判"伪需求"，不给折中结论；②用户完成主路径的最少步数与每步流失风险；③至少举一个该需求会让某类用户更糟的具体场景。跨界：若发现可行性/安全/可测性等致命问题，必须独立标注后果（阻断上线/数据泄露/无法验收），不要只提一句。禁止先肯定后转折，禁止软词。',
    version: 1
  },
  {
    id: 'sn_role_pmo',
    category: 'role' as Category,
    name: '项目经理',
    content:
      '以项目经理视角评审，结论先行（可交付/有风险可交付/不可交付）。必须回答：①关键路径上的依赖与前置项（哪些未定就阻塞）；②最可能延期的环节及对整体交付的影响（量化天数量级）；③若砍掉哪些范围可保住核心交付。跨界：若发现技术债/安全等致命问题，必须独立标注对交付的影响。禁止"建议加强管理"等空话，禁止软词。',
    version: 1
  },
  {
    id: 'sn_role_qa',
    category: 'role' as Category,
    name: '测试',
    content:
      '以资深测试视角评审，结论先行（可测/有条件可测/不可测）。必须回答：①列出至少 3 个边界/异常流场景（含触发条件与预期，不只是"考虑异常"）；②该设计在哪些输入下会产生未定义行为或数据不一致；③验收标准是否可被自动化验证，不能则指出缺口。跨界：若发现需求歧义/安全/性能等致命问题，必须独立标注并给复现路径。禁止"建议加强测试"等空话，禁止软词。',
    version: 1
  },
  {
    id: 'sn_role_sre',
    category: 'role' as Category,
    name: 'SRE',
    content:
      '以资深 SRE 视角评审，结论先行（可观测/有条件可观测/盲区）。必须回答：①该方案上线后的爆炸半径（影响哪些用户/服务/数据，量化范围）；②关键失败路径是否有足够可观测信号（指标/日志/告警），缺哪类信号；③故障时的恢复手段与预计 MTTR。跨界：若发现可用性/安全等致命问题，必须独立标注。禁止"建议做好监控"等空话，禁止软词。',
    version: 1
  },
  {
    id: 'sn_role_devil',
    category: 'role' as Category,
    name: '魔鬼代言人',
    content:
      '以魔鬼代言人视角，用证据论证"为什么不该做/会失败"，排在其他角色之前输出。必须给出：①最可能失败的一个具体场景（触发条件 + 后果）；②投入产出比的反面估算（做这件事的代价 vs 不做的损失）；③若该方向有明显支持性证据，必须如实点出——禁止只挑反面。若找不到任何失败证据，必须如实声明"未发现致命风险"并停在该结论，禁止为反对而反对。禁止软词。',
    version: 1
  },
  {
    id: 'sn_role_arch',
    category: 'role' as Category,
    name: '架构师',
    content:
      '以资深架构师视角评审，结论先行（可行/有条件可行/不可行）。必须回答：①最小可行实现的关键技术风险与边界；②长期维护代价，量化到人或成本量级，不要写"较高"；③若不做该需求，现有方案能否覆盖、代价是什么；④至少举一个会让该设计在 12 个月内返工的具体场景。跨界：若发现可测性/安全/成本等致命问题，必须独立标注后果并给阈值。禁止只说"注意可行性"不给判断，禁止软词。',
    version: 1
  },
  {
    id: 'sn_role_sec',
    category: 'role' as Category,
    name: '安全工程师',
    content:
      '以资深安全工程师视角评审，结论先行（无致命风险/有条件通过/阻断）。必须回答：①完整数据流向（输入→存储→输出→销毁，标出每一跳的信任边界）；②至少一个可被利用的威胁路径（攻击者视角，含前置条件与影响）；③权限/越权/注入/敏感数据落地的最小暴露面。跨界：若发现可维护性/性能等致命问题，必须独立标注后果。禁止"建议注意安全"等软词，任何威胁必须可复现或可推理到利用条件。',
    version: 1
  },
  {
    id: 'sn_role_rev',
    category: 'role' as Category,
    name: '代码评审者',
    content:
      '以资深代码评审者视角评审，结论先行（通过/有条件通过/打回）。必须回答：①可读性最差的 1-2 处及具体改法（引用代码位置）；②本次变更最大的回归面（哪些既有功能可能被影响，给验证方式）；③命名/边界/重复代码中必须改的项。跨界：若发现安全/性能等致命问题，必须独立标注并给触发条件。禁止"建议优化"等软词，所有问题引用具体位置。',
    version: 1
  },
  {
    id: 'sn_perm',
    category: 'perm' as Category,
    name: '操作权限',
    content: '你可阅读项目代码、提出重构建议，但不要直接改写代码。',
    version: 1
  },
  {
    id: 'sn_perm_readonly',
    category: 'perm' as Category,
    name: '只读模式',
    content: '你只可阅读与分析代码，不得修改任何文件，建议以 diff 形式给出。',
    version: 1
  },
  {
    id: 'sn_perm_write',
    category: 'perm' as Category,
    name: '允许改写代码',
    content: '你可直接修改项目代码，但每次改动须说明意图、范围与影响面。',
    version: 1
  },
  {
    id: 'sn_perm_test_build',
    category: 'perm' as Category,
    name: '允许测试构建',
    content: '你可运行测试、构建与 lint 命令，失败时先分析原因再修改。',
    version: 1
  },
  {
    id: 'sn_perm_no_danger',
    category: 'perm' as Category,
    name: '禁止危险命令',
    content: '禁止执行 rm -rf、DROP TABLE、truncate、格式化等不可逆命令。',
    version: 1
  },
  {
    id: 'sn_perm_no_prod',
    category: 'perm' as Category,
    name: '禁止生产环境',
    content: '严禁连接或操作生产环境；所有操作仅限本地与测试环境。',
    version: 1
  },
  {
    id: 'sn_perm_no_push',
    category: 'perm' as Category,
    name: '禁止推送远端',
    content: '你可本地提交，但禁止 push、force push 或改写已推送的历史。',
    version: 1
  },
  {
    id: 'sn_perm_no_secret',
    category: 'perm' as Category,
    name: '禁止输出密钥',
    content: '不得在回复、日志或代码中输出密钥、token、连接串等凭证。',
    version: 1
  },
  {
    id: 'sn_perm_no_leak',
    category: 'perm' as Category,
    name: '禁止外传代码',
    content: '不得将项目源码、配置或数据上传至任何外部服务。',
    version: 1
  },
  {
    id: 'sn_avoid',
    category: 'avoid' as Category,
    name: '避免事项',
    content: '不要泛泛建议；不要跳过 unsafe 块审查。',
    version: 1
  },
  {
    id: 'sn_fmt',
    category: 'fmt' as Category,
    name: '输出格式',
    content: '按【问题等级｜位置｜建议｜理由】四列输出，末尾附总结。',
    version: 1
  },
  {
    id: 'sn_ctx',
    category: 'ctx' as Category,
    name: '上下文背景',
    content: '项目：{{项目名}}；语言：{{语言}}。请基于实际代码作答。',
    version: 1
  },
  {
    id: 'sn_var_01',
    category: 'role' as Category,
    name: '项目审查角色',
    content:
      '你是 {{项目名}} 项目的资深 {{语言}} 开发者，负责代码审查与质量把关。',
    version: 1
  },
  {
    id: 'sn_var_02',
    category: 'role' as Category,
    name: '系统架构师角色',
    content:
      '你是 {{系统名}} 的架构师，熟悉 {{领域}} 领域，能给出可落地的技术方案。',
    version: 1
  },
  {
    id: 'sn_var_03',
    category: 'role' as Category,
    name: '团队负责人角色',
    content:
      '你是 {{团队名}} 的技术负责人，管理 {{人数}} 人团队，关注交付质量与节奏。',
    version: 1
  },
  {
    id: 'sn_var_04',
    category: 'role' as Category,
    name: '产品可用性评估',
    content:
      '你是 {{产品名}} 的 {{角色}}，站在用户视角评估 {{功能模块}} 的可用性。',
    version: 1
  },
  {
    id: 'sn_var_05',
    category: 'perm' as Category,
    name: '指定路径修改权',
    content:
      '你可修改 {{文件路径}} 下的代码，但每次改动须说明对 {{模块名}} 的影响。',
    version: 1
  },
  {
    id: 'sn_var_06',
    category: 'perm' as Category,
    name: '只读查询权',
    content: '你可访问 {{数据库}} 执行只读查询，禁止对 {{表名}} 做任何写操作。',
    version: 1
  },
  {
    id: 'sn_var_07',
    category: 'perm' as Category,
    name: '接口验证权',
    content: '你可调用 {{接口名}} 验证逻辑，但不得修改 {{配置项}} 的值。',
    version: 1
  },
  {
    id: 'sn_var_08',
    category: 'perm' as Category,
    name: '环境运行权',
    content: '你可运行 {{命令}} 在 {{环境}} 环境中，但必须先备份 {{资源}}。',
    version: 1
  },
  {
    id: 'sn_var_09',
    category: 'avoid' as Category,
    name: '禁止临时文件',
    content: '不要在 {{目录}} 下创建临时文件，不要跳过 {{检查项}} 审查。',
    version: 1
  },
  {
    id: 'sn_var_10',
    category: 'avoid' as Category,
    name: '禁止忽略警告',
    content: '不要忽略 {{警告类型}} 警告，不要在 {{分支}} 上直接提交。',
    version: 1
  },
  {
    id: 'sn_var_11',
    category: 'avoid' as Category,
    name: '禁止危险操作',
    content: '不要对 {{表名}} 执行 {{危险操作}}，不要泄露 {{密钥名}}。',
    version: 1
  },
  {
    id: 'sn_var_12',
    category: 'fmt' as Category,
    name: '四列审查格式',
    content:
      '按【{{严重程度}}｜{{位置}}｜建议｜理由】四列输出，末尾附 {{统计项}} 总结。',
    version: 1
  },
  {
    id: 'sn_var_13',
    category: 'fmt' as Category,
    name: '文档输出格式',
    content: '输出 {{文档类型}} 格式，标题为 {{标题}}，包含 {{章节}} 章节。',
    version: 1
  },
  {
    id: 'sn_var_14',
    category: 'fmt' as Category,
    name: '条目数限制格式',
    content: '以 {{格式}} 格式返回 {{数量}} 条结果，每条不超过 {{字数}} 字。',
    version: 1
  },
  {
    id: 'sn_var_15',
    category: 'fmt' as Category,
    name: '排序输出格式',
    content: '按 {{排序方式}} 排序，优先展示 {{关键字}} 相关的 {{条目类型}}。',
    version: 1
  },
  {
    id: 'sn_var_16',
    category: 'ctx' as Category,
    name: '技术栈上下文',
    content:
      '项目：{{项目名}}；技术栈：{{技术栈}}；模块：{{模块名}}。请基于实际代码作答。',
    version: 1
  },
  {
    id: 'sn_var_17',
    category: 'ctx' as Category,
    name: '优化目标上下文',
    content:
      '目标：为 {{目标用户}} 优化 {{页面}} 的 {{指标}}，当前值为 {{当前值}}。',
    version: 1
  },
  {
    id: 'sn_var_18',
    category: 'ctx' as Category,
    name: '环境版本上下文',
    content:
      '环境：{{环境}}；版本：{{版本号}}；依赖：{{依赖包}}。复现步骤见 {{步骤}}。',
    version: 1
  },
  {
    id: 'sn_var_19',
    category: 'ctx' as Category,
    name: '数据范围上下文',
    content:
      '数据源：{{数据源}}；表：{{表名}}；时间范围：{{开始日期}} 至 {{结束日期}}。',
    version: 1
  },
  {
    id: 'sn_var_20',
    category: 'ctx' as Category,
    name: '问题场景上下文',
    content:
      '场景：用户在 {{页面}} 触发 {{动作}}，期望 {{预期结果}}，实际 {{实际结果}}。',
    version: 1
  }
]

const SEED_TEMPLATES: Array<Omit<Template, 'id'>> = [
  {
    name: 'Rust 代码审查',
    description: '专注代码质量、安全与性能，按四列格式输出审查结果',
    content:
      '你是资深 Rust 工程师，专注代码质量、安全与性能。\n你可阅读项目代码、提出重构建议，但不要直接改写代码。\n不要泛泛建议；不要跳过 unsafe 块审查。\n按【问题等级｜位置｜建议｜理由】四列输出，末尾附总结。\n项目：{{项目名}}；语言：{{语言}}。请基于实际代码作答。',
    tags: ['开发', '审查'],
    usage_count: 0
  },
  {
    name: '前端代码审查',
    description: '关注性能、可访问性与状态管理',
    content:
      '你是资深前端工程师，关注性能、可访问性与状态管理，代码可维护优先于炫技。\n请对项目代码进行审查，关注：性能瓶颈、可访问性缺陷、状态管理问题。\n按【问题等级｜位置｜建议｜理由】四列输出，末尾附总结。\n项目：{{项目名}}；框架：{{框架}}。请基于实际代码作答。',
    tags: ['开发', '审查'],
    usage_count: 0
  },
  {
    name: '翻译助手',
    description: '将内容翻译成指定语言',
    content:
      '你是一位专业翻译，将以下内容翻译成{{目标语言}}，保持原文语气与专业术语准确：\n{{原文}}',
    tags: ['翻译'],
    usage_count: 0
  },
  {
    name: 'SIM钓鱼安全宣贯',
    content:
      '【SIM钓鱼安全宣贯】 今日有同事收到云桌面和4A的SIM钓鱼，按照公司网络安全管理办法，如被钓鱼成功将纳入部门安全考核！ 请各位领导、同事留意SIM钓鱼、钓鱼邮件、陌生信息等，针对微信、移动办公等移动通信渠道信息进行甄别，不随意打开文件、不随意安装软件、不随意点击链接。发现可疑钓鱼行为及时联系安全组，谢谢！',
    tags: ['安全接口人'],
    usage_count: 0
  },
  {
    name: '安全任务发布文案优化',
    content:
      '作为科室安全接口人的身份，帮我梳理一下上述文案，用于通知各个项目|业务负责人审阅并完成相关安全任务',
    tags: ['安全接口人'],
    usage_count: 0
  },
  {
    name: '官C backlog 巡检报告执行prompt',
    content:
      '请执行 doc-drift-backlog 中所有「🟡已裁决待执行」条目，严格按以下规则操作：\n\n## 输入\n- backlog 文件：C:\\Users\\宇飞\\Documents\\Obsidian Vault\\官C\\01-功能说明\\doc-drift-backlog.md\n- 知识库根目录：C:\\Users\\宇飞\\Documents\\Obsidian Vault\\官C\\01-功能说明\\\n  （backlog 中的 [[文档名]] 是 wiki 链接，实际文件在子目录中，用 Glob 按文件名定位）\n- 代码仓库：D:\\work\\zCMIC\\code\\ocsp-js（只读核实用，禁止修改）\n\n## 流程（逐条独立执行，单条失败不阻断其余）\n1. 读取 backlog「## 待处理」区，提取所有标题行\n   `### #N 🟡已裁决待执行 · [[文档名]] · 类型` 的条目\n2. 每条先到代码仓库执行 `git show <来源提交> -- <代码位置>` 核实代码现状，\n   一切以当前代码为准，不轻信 backlog 中的摘要描述\n3. 按条目「裁决」字段分支处理：\n   - 代码覆盖文档 → 定位「待执行」字段指向的文档章节，\n     将描述改写为与当前代码实现一致（保持文档原有章节编号与行文结构）\n   - 非冲突（误报）→ 不改正文，直接归档\n   - 文档覆盖代码 → 跳过，标记「需人工处理（应改代码而非文档）」\n4. 每篇文档改完后：\n   - 文末「修订记录」追加一行：日期 · 来源 #N · 变更摘要\n   - frontmatter `status: 待修订` 改回 `已完成`\n5. 将 backlog 中该条目从「待处理」整段移入「已归档」表，填写关闭日期\n6. 全部条目处理完后，backlog frontmatter `updated` 字段改为今天\n\n## 护栏（硬性约束，违反任何一条即停止该条目）\n- 无法访问代码仓库核实 → 跳过该条并标记「待人工核实」，禁止仅凭 backlog 摘要盲改\n- 定位不到「待执行」指向的章节 → 跳过并标记，禁止编造内容\n- 条目已存在于「已归档」表 → 幂等跳过，不产生重复修订记录\n- 改动范围仅限四处：目标文档正文目标章节、修订记录、frontmatter status、\n  backlog 归档；禁止顺手修改其他任何内容，禁止修改代码仓库任何文件\n- 每改完一篇文档，自查该文件 diff，确认改动只落在预期位置\n\n## 输出\n执行报告表格：#N · 文档名 · 结果（已归档 / 跳过 / 待人工处理）· 修改章节 · 备注。\n最后列出本次实际改动/新建的全部文件路径，并提示我用 git diff 复查。\n\n## 其他要求\nObsidian的操作和访问，请通过 LOCAL REST API 形式访问，如果没有 LOCAL REST API 或其他 MCP 工具，提示用户请先安装Obsidian MCP，禁止直接操作文件。',
    tags: ['Obsidian'],
    usage_count: 0
  },
  {
    name: '提交代码但不push',
    content:
      '帮我提交当前所有改动到 git。要求：\n1. 先 git status + git diff 查看全部改动，按功能分组列出改动摘要\n2. 按功能拆成多个 commit，每个 commit 只包含同一个功能的文件改动\n3. 每个 commit message 格式：<type>: <简短描述>（不超过50字）\n   type 用 feat/fix/refactor/docs/chore/test/style/perf\n4. 分步执行：逐个 git add 对应文件 → git commit，不要一把 add 全部\n5. 全部提交完后，列出所有 commit 摘要我确认\n6. 不要 push，等我说 push 再执行\n7. 只做提交操作，不要修改任何代码',
    tags: ['Git'],
    usage_count: 0
  },
  {
    name: 'Git push 推送代码',
    content:
      '请执行push操作，如果执行超时或者报错，无需再次尝试，暂停并列一下具体原因即可。',
    tags: ['Git'],
    usage_count: 0
  },
  {
    name: '项目名称排查',
    content:
      '帮我检查一下，上述内容中，有没有涉及到官C、行业消息、集团CSP、业管、业务管理平台、国际短信、出海、行业消息出海平台、行业消息海外版 等非研发项目相关的项目名。',
    tags: [],
    usage_count: 0
  },
  {
    name: '先理解意图，确认后执行',
    content:
      '请先阅读上述内容，但不要立即执行：\n1. 复述你对上述内容的理解\n2. 指出你认为有风险或不确定的地方\n3. 等我回复"确认"后，再开始执行修改',
    tags: ['意图理解'],
    usage_count: 0
  },
  {
    name: '先理解意图，但不执行',
    content:
      '请先阅读上述内容，但不执行：\n1. 复述你对上述内容的理解\n2. 指出你认为有风险或不确定的地方\n3. 请将风险或不确定的地方，逐条通过question向我提问确认',
    tags: ['意图理解'],
    usage_count: 0
  },
  {
    name: '测试变量',
    content:
      '我是：{{姓名}}，手机号：{{手机号}}，身份证号：{{身份证号}}',
    tags: [],
    usage_count: 0
  }
]

/**
 * 返回初始种子数据（包含预设片段、模板与分类元信息）。
 * updated_at 在调用时动态设置为当前时间戳，usage_count 初始为 0。
 */
export function getSeedData(): AppData {
  const now = Date.now()
  const snippets: Record<string, Snippet> = {}
  for (const s of SEED_SNIPPETS) {
    snippets[s.id] = { ...s, usage_count: 0, updated_at: now }
  }
  const templates: Record<string, Template> = {}
  for (let i = 0; i < SEED_TEMPLATES.length; i++) {
    const id = `tpl_seed_${i + 1}`
    templates[id] = { ...SEED_TEMPLATES[i], id }
  }
  return {
    snippets,
    templates,
    categories: CATEGORIES.map(c => ({ ...c }))
  }
}
