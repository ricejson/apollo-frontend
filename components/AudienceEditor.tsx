
import React from 'react';
import { Audience, Rule, Operator, Language } from '../types';
import { PlusIcon, TrashIcon } from './Icons';
import { translations } from '../translations';

interface AudienceEditorProps {
  audience: Audience;
  onUpdate: (updatedAudience: Audience) => void;
  onDelete: () => void;
  lang: Language;
}

const AudienceEditor: React.FC<AudienceEditorProps> = ({ audience, onUpdate, onDelete, lang }) => {
  const t = translations[lang];

  const addRule = () => {
    const newRule: Rule = {
      id: Math.random().toString(36).substr(2, 9),
      attribute: 'user_id',
      operator: Operator.EQUALS,
      value: ''
    };
    onUpdate({ ...audience, rules: [...audience.rules, newRule] });
  };

  const updateRule = (ruleId: string, updates: Partial<Rule>) => {
    const updatedRules = audience.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
    onUpdate({ ...audience, rules: updatedRules });
  };

  const deleteRule = (ruleId: string) => {
    onUpdate({ ...audience, rules: audience.rules.filter(r => r.id !== ruleId) });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-6 rounded-md bg-indigo-50 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            {t.if}
          </span>
          <input
            type="text"
            className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none transition-all px-1"
            value={audience.name}
            onChange={(e) => onUpdate({ ...audience, name: e.target.value })}
            placeholder="Audience Name"
          />
        </div>
        <button 
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
        >
          <TrashIcon />
        </button>
      </div>

      <div className="space-y-4">
        {audience.rules.length === 0 && (
          <p className="text-sm text-gray-400 italic py-2">No rules defined.</p>
        )}
        
        {audience.rules.map((rule, idx) => (
          <div key={rule.id} className="flex flex-wrap items-center gap-3 animate-fadeIn">
            {idx > 0 && <span className="text-[10px] font-black text-gray-300 w-full mb-1 uppercase tracking-tighter">{t.and}</span>}
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={rule.attribute}
                onChange={(e) => updateRule(rule.id, { attribute: e.target.value, customAttribute: e.target.value === 'custom' ? '' : undefined })}
              >
                {Object.entries(t.attributes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              {rule.attribute === 'custom' && (
                <input
                  type="text"
                  className="w-32 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder={t.customAttrPlaceholder}
                  value={rule.customAttribute || ''}
                  onChange={(e) => updateRule(rule.id, { customAttribute: e.target.value })}
                />
              )}
            </div>

            <select
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={rule.operator}
              onChange={(e) => updateRule(rule.id, { operator: e.target.value as Operator })}
            >
              {Object.entries(t.operators).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <input
              type="text"
              className="flex-1 min-w-[120px] px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder={rule.attribute === 'traffic' ? t.trafficPlaceholder : t.valuePlaceholder}
              value={rule.value}
              onChange={(e) => updateRule(rule.id, { value: e.target.value })}
            />

            <button 
              onClick={() => deleteRule(rule.id)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addRule}
        className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors group"
      >
        <div className="p-1 rounded-full bg-indigo-50 group-hover:bg-indigo-100">
          <PlusIcon />
        </div>
        {t.addCondition}
      </button>
    </div>
  );
};

export default AudienceEditor;
