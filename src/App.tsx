import { useEffect } from 'react';
import { useSnippetStore } from '@/stores/snippetStore';
import { useUIStore } from '@/stores/uiStore';
import { useGlobalShortcut } from '@/hooks/useGlobalShortcut';
import Overlay from './components/Overlay/Overlay';
import SearchBar from './components/SearchBar/SearchBar';
import AssemblyTrack from './components/AssemblyTrack/AssemblyTrack';
import PreviewPanel from './components/PreviewPanel/PreviewPanel';
import BottomBar from './components/BottomBar/BottomBar';
import SnippetLibrary from './components/SnippetLibrary/SnippetLibrary';
import SnippetEditor from './components/SnippetEditor/SnippetEditor';
import Toast from './components/Toast/Toast';

/**
 * Prompt Factory MVP 根组件。
 * 布局顺序：SearchBar → AssemblyTrack → PreviewPanel → BottomBar → SnippetLibrary
 * SnippetEditor 显示时替换 SnippetLibrary 位置。
 */
function App() {
  const loadSnippets = useSnippetStore((s) => s.loadSnippets);
  const showSnippetEditor = useUIStore((s) => s.showSnippetEditor);

  useGlobalShortcut();

  useEffect(() => {
    void loadSnippets();
  }, [loadSnippets]);

  return (
    <Overlay>
      <SearchBar />
      <AssemblyTrack />
      <PreviewPanel />
      <BottomBar />
      {showSnippetEditor ? <SnippetEditor /> : <SnippetLibrary />}
      <Toast />
    </Overlay>
  );
}

export default App;
