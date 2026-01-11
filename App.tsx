
import React, { useState, useMemo, useEffect } from 'react';
import { Toggle, Audience, Language } from './types';
import { PlusIcon, ZapIcon, LayersIcon, CodeIcon, TrashIcon, DownloadIcon } from './components/Icons';
import AudienceEditor from './components/AudienceEditor';
import SdkSnippet from './components/SdkSnippet';
import { getSmartDescription } from './services/geminiService';
import { translations } from './translations';

// Mock Storage Key
const STORAGE_KEY = 'apollo_toggles_data';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [toggles, setToggles] = useState<Toggle[]>([]);
  const [activeToggleId, setActiveToggleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newToggleData, setNewToggleData] = useState({ name: '', key: '' });

  const t = translations[lang];

  // Initialize data from LocalStorage
  useEffect(() => {
    const loadData = async () => {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 800));

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setToggles(parsed);
        if (parsed.length > 0) setActiveToggleId(parsed[0].id);
      } else {
        // Seed initial data
        const initialData: Toggle[] = [
          {
            id: 'tg_1',
            name: '智能推荐算法 v2',
            key: 'smart_recommender_v2',
            description: '基于用户行为路径的新型推荐引擎，旨在提高点击率。',
            status: 'enabled',
            createdAt: '2024-03-20',
            updatedAt: '2024-03-22',
            audiences: [
              {
                id: 'aud_1',
                name: '北京/上海核心测试用户',
                rules: [
                  { id: 'r1', attribute: 'city', operator: 'in' as any, value: 'Beijing, Shanghai' },
                  { id: 'r2', attribute: 'traffic', operator: 'lt' as any, value: '20' }
                ]
              }
            ]
          }
        ];
        setToggles(initialData);
        setActiveToggleId(initialData[0].id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Sync to LocalStorage whenever toggles change
  const saveToStorage = (updatedToggles: Toggle[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedToggles));
    setToggles(updatedToggles);
  };

  const activeToggle = useMemo(() =>
          toggles.find(t => t.id === activeToggleId) || null
      , [toggles, activeToggleId]);

  const filteredToggles = useMemo(() =>
          toggles.filter(t =>
              t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.key.toLowerCase().includes(searchQuery.toLowerCase())
          )
      , [toggles, searchQuery]);

  const handleCreateToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    const description = await getSmartDescription(newToggleData.name, newToggleData.key);
    const newToggle: Toggle = {
      id: 'tg_' + Math.random().toString(36).substr(2, 9),
      name: newToggleData.name,
      key: newToggleData.key.toLowerCase().replace(/\s+/g, '_'),
      description: description,
      status: 'disabled',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      audiences: []
    };

    const updated = [newToggle, ...toggles];
    saveToStorage(updated);
    setActiveToggleId(newToggle.id);
    setIsCreating(false);
    setNewToggleData({ name: '', key: '' });
  };

  const updateToggle = (id: string, updates: Partial<Toggle>) => {
    const updated = toggles.map(t =>
        t.id === id
            ? { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
            : t
    );
    saveToStorage(updated);
  };

  const addAudience = () => {
    if (!activeToggle) return;
    const newAudience: Audience = {
      id: 'aud_' + Math.random().toString(36).substr(2, 9),
      name: lang === 'zh' ? '新人群组' : 'New Audience Group',
      rules: []
    };
    updateToggle(activeToggle.id, { audiences: [...activeToggle.audiences, newAudience] });
  };

  const deleteToggle = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      const remaining = toggles.filter(t => t.id !== id);
      saveToStorage(remaining);
      if (activeToggleId === id) setActiveToggleId(remaining[0]?.id || null);
    }
  };

  const handleExportJson = () => {
    if (!activeToggle) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeToggle, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${activeToggle.key}_config.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setIsExporting(false);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  if (isLoading) {
    return (
        <div className="h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest animate-pulse">Initializing Apollo...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm shrink-0">
          <div className="p-6 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <ZapIcon />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight text-gray-900 leading-none mb-1">Apollo</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.grayscale}</p>
              </div>
            </div>
            <button
                onClick={toggleLanguage}
                className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-all border border-indigo-100"
            >
              {t.langToggle}
            </button>
          </div>

          <div className="p-4">
            <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold shadow-md shadow-indigo-100"
            >
              <PlusIcon /> {t.createToggle}
            </button>
          </div>

          <div className="px-4 mb-4">
            <div className="relative">
              <input
                  type="text"
                  placeholder={t.filterPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3.5 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
            {filteredToggles.length === 0 && searchQuery && (
                <p className="text-center text-gray-400 py-8 text-xs">未找到相关开关</p>
            )}
            {filteredToggles.map(toggle => (
                <button
                    key={toggle.id}
                    onClick={() => setActiveToggleId(toggle.id)}
                    className={`w-full flex flex-col items-start p-4 rounded-xl transition-all group border ${
                        activeToggleId === toggle.id
                            ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                            : 'bg-transparent border-transparent hover:bg-gray-50'
                    }`}
                >
                  <div className="flex justify-between items-center w-full mb-1">
                <span className={`font-bold text-sm truncate ${activeToggleId === toggle.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                  {toggle.name}
                </span>
                    <span className={`w-2 h-2 rounded-full ${toggle.status === 'enabled' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  </div>
                  <code className="text-[10px] text-gray-400 font-mono font-medium">{toggle.key}</code>
                </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeToggle ? (
              <>
                <header className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center shrink-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-1">
                      <h2 className="text-2xl font-black text-gray-900 truncate tracking-tight">{activeToggle.name}</h2>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          activeToggle.status === 'enabled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                    {activeToggle.status === 'enabled' ? t.enabled : t.disabled}
                  </span>
                    </div>
                    <p className="text-gray-500 text-sm max-w-2xl line-clamp-1">{activeToggle.description}</p>
                  </div>

                  <div className="flex items-center gap-3 ml-6">
                    <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
                      <button
                          onClick={() => updateToggle(activeToggle.id, { status: 'disabled' })}
                          className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeToggle.status === 'disabled' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {t.off}
                      </button>
                      <button
                          onClick={() => updateToggle(activeToggle.id, { status: 'enabled' })}
                          className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeToggle.status === 'enabled' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {t.on}
                      </button>
                    </div>

                    <button
                        onClick={() => setIsExporting(true)}
                        title={t.exportConfig}
                        className="flex items-center gap-2 p-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
                    >
                      <DownloadIcon />
                      导出配置
                    </button>

                    <button
                        onClick={() => deleteToggle(activeToggle.id)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-1">
                          <LayersIcon /> {t.targetingAudiences}
                        </h3>
                        <p className="text-sm text-gray-400 font-medium">{t.targetingDesc}</p>
                      </div>
                      <button
                          onClick={addAudience}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                      >
                        <PlusIcon /> {t.addAudience}
                      </button>
                    </div>

                    <div className="space-y-6">
                      {activeToggle.audiences.map((audience, index) => (
                          <React.Fragment key={audience.id}>
                            {index > 0 && (
                                <div className="flex items-center gap-4 py-2">
                                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                                  <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-4 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">{t.or}</span>
                                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                                </div>
                            )}
                            <AudienceEditor
                                audience={audience}
                                lang={lang}
                                onUpdate={(updated) => {
                                  const updatedAudiences = activeToggle.audiences.map(a => a.id === updated.id ? updated : a);
                                  updateToggle(activeToggle.id, { audiences: updatedAudiences });
                                }}
                                onDelete={() => {
                                  const filtered = activeToggle.audiences.filter(a => a.id !== audience.id);
                                  updateToggle(activeToggle.id, { audiences: filtered });
                                }}
                            />
                          </React.Fragment>
                      ))}

                      {activeToggle.audiences.length === 0 && (
                          <div className="border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center bg-gray-50/30">
                            <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                              <LayersIcon />
                            </div>
                            <h4 className="text-gray-900 font-black text-lg mb-2">{t.noAudiences}</h4>
                            <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto font-medium">{t.noAudiencesDesc}</p>
                            <button
                                onClick={addAudience}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                              {t.createFirst}
                            </button>
                          </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-12 border-t border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-2">
                      <CodeIcon /> {t.implementation}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium mb-8">{t.implementationDesc}</p>
                    <SdkSnippet toggleKey={activeToggle.key} />
                  </div>

                  <footer className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-300 uppercase tracking-widest font-black">
                    <span>{t.toggleId}: {activeToggle.id}</span>
                    <span>{t.lastUpdated}: {activeToggle.updatedAt}</span>
                  </footer>
                </div>
              </>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-200 mb-8 animate-pulse shadow-inner shadow-indigo-100">
                  <ZapIcon />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">{t.welcome}</h2>
                <p className="text-gray-400 font-medium max-w-md mb-10 leading-relaxed">{t.welcomeDesc}</p>
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100"
                >
                  {t.createToggle}
                </button>
              </div>
          )}
        </main>

        {/* Create Toggle Modal */}
        {isCreating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fadeIn">
              <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-10">
                  <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <PlusIcon />
                    </div>
                    {t.createModalTitle}
                  </h3>
                  <form onSubmit={handleCreateToggle} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">{t.toggleNameLabel}</label>
                      <input
                          type="text"
                          required
                          autoFocus
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-300"
                          placeholder="e.g. New User Dashboard"
                          value={newToggleData.name}
                          onChange={(e) => setNewToggleData({ ...newToggleData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">{t.toggleKeyLabel}</label>
                      <input
                          type="text"
                          required
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white font-mono text-xs transition-all text-gray-900 placeholder:text-gray-300"
                          placeholder="e.g. new_dashboard_v2"
                          value={newToggleData.key}
                          onChange={(e) => setNewToggleData({ ...newToggleData, key: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                          type="button"
                          onClick={() => setIsCreating(false)}
                          className="flex-1 px-4 py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-900 transition-all"
                      >
                        {t.cancel}
                      </button>
                      <button
                          type="submit"
                          className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                      >
                        {t.submit}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
        )}

        {/* Export Configuration Modal */}
        {isExporting && activeToggle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fadeIn">
              <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <DownloadIcon />
                    </div>
                    {t.exportModalTitle}
                  </h3>
                  <code className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-400 tracking-widest uppercase">
                    {activeToggle.key}
                  </code>
                </div>

                <div className="flex-1 overflow-auto p-6 bg-gray-900">
              <pre className="text-xs sm:text-sm font-mono text-indigo-300 leading-relaxed">
                <code>{JSON.stringify(activeToggle, null, 2)}</code>
              </pre>
                </div>

                <div className="p-8 bg-white border-t border-gray-50 flex gap-4">
                  <button
                      onClick={() => setIsExporting(false)}
                      className="flex-1 px-4 py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-900 transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button
                      onClick={handleExportJson}
                      className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    <DownloadIcon /> {t.download}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default App;
