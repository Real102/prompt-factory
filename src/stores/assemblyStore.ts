// ============================================================
// Prompt Factory - 拼装台 Store
// 管理拼装台片段顺序、模板选择、变量填充、合成文本、注入与复制
// ============================================================

import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import { compose } from '@/services/composeEngine'
import { extractVars, fillVars } from '@/services/variableEngine'
import { useSnippetStore } from './snippetStore'
import { useTemplateStore } from './templateStore'
import { useUIStore } from './uiStore'

/** 拼装台 Store 接口 */
interface AssemblyStore {
  assemblyItems: string[]
  composedText: string
  canAction: boolean
  mode: 'assembly' | 'editing'
  isLocked: boolean
  editedText: string | null
  selectedTemplateId: string | null
  variables: Record<string, string>
  addToAssembly: (id: string) => void
  removeFromAssembly: (id: string) => void
  reorderAssembly: (from: number, to: number) => void
  clearAssembly: () => void
  enterEditing: () => void
  exitEditing: () => void
  resetEditing: () => void
  setEditedText: (text: string) => void
  selectTemplate: (templateId: string) => void
  setVariable: (name: string, value: string) => void
  clearTemplateSelection: () => void
  injectToCursor: () => Promise<void>
  copyToClipboard: () => Promise<void>
}

function computeComposedText(assemblyItems: string[]): string {
  const snippets = useSnippetStore.getState().snippets
  return compose(assemblyItems, snippets)
}

/** 注入/复制成功后，对当前选中的模板或拼装台片段 usage_count +1 */
function incrementUsageForSelection(state: AssemblyStore): void {
  if (state.selectedTemplateId) {
    void useTemplateStore.getState().incrementUsage(state.selectedTemplateId)
  } else {
    for (const id of state.assemblyItems) {
      void useSnippetStore.getState().incrementUsage(id)
    }
  }
}

export const useAssemblyStore = create<AssemblyStore>((set, get) => ({
  assemblyItems: [],
  composedText: '',
  variables: {},
  canAction: false,
  mode: 'assembly',
  isLocked: false,
  editedText: null,
  selectedTemplateId: null,
  variables: {},

  addToAssembly: id => {
    if (get().isLocked) return
    if (get().selectedTemplateId) {
      set({ selectedTemplateId: null, variables: {} })
    }
    const { assemblyItems } = get()
    if (assemblyItems.includes(id)) return
    const next = [...assemblyItems, id]
    set({
      assemblyItems: next,
      composedText: computeComposedText(next),
      variables: {},
      canAction: next.length > 0
    })
  },

  removeFromAssembly: id => {
    if (get().isLocked) return
    if (get().selectedTemplateId) return
    const { assemblyItems } = get()
    const next = assemblyItems.filter(item => item !== id)
    set({
      assemblyItems: next,
      composedText: computeComposedText(next),
      canAction: next.length > 0
    })
  },

  reorderAssembly: (from, to) => {
    if (get().isLocked) return
    if (get().selectedTemplateId) return
    const { assemblyItems } = get()
    if (
      from < 0 ||
      from >= assemblyItems.length ||
      to < 0 ||
      to >= assemblyItems.length ||
      from === to
    ) {
      return
    }
    const next = [...assemblyItems]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    set({
      assemblyItems: next,
      composedText: computeComposedText(next),
      canAction: next.length > 0
    })
  },

  clearAssembly: () => {
    set({
      assemblyItems: [],
      composedText: '',
      variables: {},
      canAction: false,
      mode: 'assembly',
      isLocked: false,
      editedText: null,
      selectedTemplateId: null,
      variables: {}
    })
    useUIStore.getState().setSelectedTemplate(null)
  },

  enterEditing: () => {
    const { composedText, editedText, variables } = get()
    // 占位符前后各加一个空格，再替换变量值
    // 编辑框中通过空格辨认变量填入部分（textarea 无法富文本高亮）
    const padded = composedText.replace(/\{\{([\w\u4e00-\u9fff]+)\}\}/g, ' $& ')
    const resolved = applyVariables(padded, variables)
    if (!resolved && !editedText) return
    set({
      mode: 'editing',
      editedText: editedText ?? resolved
    })
  },

  exitEditing: () => {
    set({
      mode: 'assembly',
      isLocked: true
    })
  },

  resetEditing: () => {
    set({
      editedText: null,
      isLocked: false,
      mode: 'assembly'
    })
  },

  setEditedText: text => {
    set({ editedText: text })
  },

  selectTemplate: templateId => {
    const tpl = useTemplateStore.getState().templates[templateId]
    if (!tpl) return
    const vars: Record<string, string> = {}
    for (const name of extractVars(tpl.content)) {
      vars[name] = ''
    }
    set({
      selectedTemplateId: templateId,
      variables: vars,
      assemblyItems: [],
      composedText: tpl.content,
      canAction: true,
      mode: 'assembly',
      isLocked: false,
      editedText: null
    })
    useUIStore.getState().setSelectedTemplate(templateId)
  },

  setVariable: (name, value) => {
    const { variables, selectedTemplateId } = get()
    if (!selectedTemplateId) return
    const tpl = useTemplateStore.getState().templates[selectedTemplateId]
    if (!tpl) return
    const nextVars = { ...variables, [name]: value }
    set({
      variables: nextVars,
      composedText: fillVars(tpl.content, nextVars)
    })
  },

  clearTemplateSelection: () => {
    set({
      selectedTemplateId: null,
      variables: {},
      composedText: '',
      canAction: false,
      mode: 'assembly',
      isLocked: false,
      editedText: null
    })
    useUIStore.getState().setSelectedTemplate(null)
  },

  injectToCursor: async () => {
    const { editedText, composedText, variables } = get()
    const text = editedText ?? applyVariables(composedText, variables)
    if (!text) return
    try {
      const ok = await invoke<boolean>('inject_text', { text })
      if (ok) {
        useUIStore.getState().hideOverlay()
        incrementUsageForSelection(get())
      } else {
        useUIStore.getState().showToast('注入失败', 'info')
      }
    } catch {
      useUIStore.getState().showToast('注入不可用', 'info')
    }
  },

  copyToClipboard: async () => {
    const { editedText, composedText, variables } = get()
    const text = editedText ?? applyVariables(composedText, variables)
    if (!text) return
    try {
      const ok = await invoke<boolean>('copy_to_clipboard', { text })
      if (ok) {
        useUIStore.getState().showToast('已复制到剪贴板', 'success')
        incrementUsageForSelection(get())
      } else {
        useUIStore.getState().showToast('复制失败', 'info')
      }
    } catch {
      useUIStore.getState().showToast('复制不可用', 'info')
    }
  }
}))

// ---- 跨 Store 同步 ----
// 拼装模式：snippetStore 变化时重算 composedText
useSnippetStore.subscribe(state => {
  const assemblyState = useAssemblyStore.getState()
  if (assemblyState.selectedTemplateId) return
  if (assemblyState.assemblyItems.length === 0) return
  const newComposed = compose(assemblyState.assemblyItems, state.snippets)
  if (newComposed !== assemblyState.composedText) {
    useAssemblyStore.setState({ composedText: newComposed })
  }
})

// 模板模式：templateStore 变化时重算 composedText（不触碰 editedText）
useTemplateStore.subscribe(state => {
  const assemblyState = useAssemblyStore.getState()
  if (!assemblyState.selectedTemplateId) return
  const tpl = state.templates[assemblyState.selectedTemplateId]
  if (!tpl) return
  const newComposed = fillVars(tpl.content, assemblyState.variables)
  if (newComposed !== assemblyState.composedText) {
    useAssemblyStore.setState({ composedText: newComposed })
  }
})
