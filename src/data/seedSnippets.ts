/**
 * Prompt Factory — 种子数据
 */

import { CATEGORIES } from '@/types'
import type { AppData, Category, Snippet, Template } from '@/types'

const SEED_SNIPPETS: Array<Omit<Snippet, 'updated_at' | 'usage_count'>> = [
  {
    id: 'sn_role',
    category: 'role' as Category,
    name: '角色设定',
    content: '你是资深 Rust 工程师，专注代码质量、安全与性能。',
    version: 1
  },
  {
    id: 'sn_role_backend',
    category: 'role' as Category,
    name: '资深后端工程师',
    content:
      '你是资深后端工程师，通晓分布式系统与高并发，注重接口契约、幂等与可观测性。',
    version: 1
  },
  {
    id: 'sn_role_frontend',
    category: 'role' as Category,
    name: '前端工程师',
    content:
      '你是资深前端工程师，关注性能、可访问性与状态管理，代码可维护优先于炫技。',
    version: 1
  },
  {
    id: 'sn_role_architect',
    category: 'role' as Category,
    name: '系统架构师',
    content:
      '你是系统架构师，先权衡一致性/可用性/成本，再给出可演进的方案，而非堆砌技术。',
    version: 1
  },
  {
    id: 'sn_role_data_analyst',
    category: 'role' as Category,
    name: '数据分析师',
    content:
      '你是数据分析师，结论必须由数据支撑，区分相关与因果，主动提示样本偏差。',
    version: 1
  },
  {
    id: 'sn_role_qa',
    category: 'role' as Category,
    name: '测试开发工程师',
    content:
      '你是测试开发工程师，覆盖正常/边界/异常路径，输出可复现的用例与缺陷描述。',
    version: 1
  },
  {
    id: 'sn_role_sre',
    category: 'role' as Category,
    name: 'SRE / 运维工程师',
    content: '你是 SRE，关注 SLI/SLO、容量、故障演练与可回滚的变更。',
    version: 1
  },
  {
    id: 'sn_role_pm',
    category: 'role' as Category,
    name: '产品经理',
    content: '你是产品经理，先明确用户价值与成功指标，方案需可落地、可度量。',
    version: 1
  },
  {
    id: 'sn_role_ux',
    category: 'role' as Category,
    name: '交互设计师',
    content:
      '你是交互设计师，关注信息架构、操作路径与异常态，输出可直接实现的交互说明。',
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
