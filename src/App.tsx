import { useEffect } from 'react'
import { useSnippetStore } from '@/stores/snippetStore'
import { useTemplateStore } from '@/stores/templateStore'
import { useUIStore } from '@/stores/uiStore'
import { useGlobalShortcut } from '@/hooks/useGlobalShortcut'
import Overlay from './components/Overlay/Overlay'
import SearchBar from './components/SearchBar/SearchBar'
import SearchResults from './components/SearchResults/SearchResults'
import AssemblyTrack from './components/AssemblyTrack/AssemblyTrack'
import VariableArea from './components/VariableArea/VariableArea'
import PreviewPanel from './components/PreviewPanel/PreviewPanel'
import BottomBar from './components/BottomBar/BottomBar'
import TabBar from './components/TabBar/TabBar'
import TemplateList from './components/TemplateList/TemplateList'
import TemplateEditor from './components/TemplateEditor/TemplateEditor'
import SnippetLibrary from './components/SnippetLibrary/SnippetLibrary'
import SnippetEditor from './components/SnippetEditor/SnippetEditor'
import Toast from './components/Toast/Toast'

function App() {
  const loadSnippets = useSnippetStore(s => s.loadSnippets)
  const loadTemplates = useTemplateStore(s => s.loadTemplates)
  const showSnippetEditor = useUIStore(s => s.showSnippetEditor)
  const editingSnippetId = useUIStore(s => s.editingSnippetId)
  const showTemplateEditor = useUIStore(s => s.showTemplateEditor)
  const editingTemplateId = useUIStore(s => s.editingTemplateId)
  const activeTab = useUIStore(s => s.activeTab)

  useGlobalShortcut()

  useEffect(() => {
    void loadSnippets()
    void loadTemplates()
  }, [loadSnippets, loadTemplates])

  return (
    <Overlay>
      <SearchBar />
      <SearchResults />
      <AssemblyTrack />
      <VariableArea />
      <PreviewPanel />
      <BottomBar />
      {showTemplateEditor ? (
        <TemplateEditor key={editingTemplateId || 'new'} />
      ) : showSnippetEditor ? (
        <SnippetEditor key={editingSnippetId || 'new'} />
      ) : (
        <>
          <TabBar />
          {activeTab === 'template' ? <TemplateList /> : <SnippetLibrary />}
        </>
      )}
      <Toast />
    </Overlay>
  )
}

export default App
