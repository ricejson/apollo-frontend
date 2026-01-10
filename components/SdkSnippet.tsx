
import React, { useState } from 'react';

const SdkSnippet: React.FC<{ toggleKey: string }> = ({ toggleKey }) => {
  const [lang, setLang] = useState<'java' | 'go' | 'js'>('js');

  const snippets = {
    js: `import { ApolloClient } from '@apollo/sdk-js';

const client = new ApolloClient({ apiKey: 'YOUR_KEY' });
const isEnabled = await client.isEnabled('${toggleKey}', {
  userId: 'user_123',
  city: 'Beijing'
});

if (isEnabled) {
  // Execute grayscale feature logic
}`,
    java: `ApolloClient client = ApolloClient.builder()
    .apiKey("YOUR_KEY")
    .build();

Context context = Context.builder()
    .add("user_id", "user_123")
    .add("city", "Beijing")
    .build();

if (client.isEnabled("${toggleKey}", context)) {
    // New feature code
}`,
    go: `client := apollo.NewClient("YOUR_KEY")
ctx := apollo.NewContext(map[string]interface{}{
    "user_id": "user_123",
    "city": "Beijing",
})

if client.IsEnabled("${toggleKey}", ctx) {
    // Grayscale logic here
}`
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden text-sm font-mono mt-8 border border-gray-700 shadow-xl">
      <div className="flex bg-gray-800 px-4 pt-3 gap-4">
        {(['js', 'java', 'go'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`pb-2 px-1 transition-all capitalize ${lang === l ? 'text-blue-400 border-b-2 border-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {l === 'js' ? 'JavaScript' : l === 'java' ? 'Java' : 'Go'}
          </button>
        ))}
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-gray-300">
          <code>{snippets[lang]}</code>
        </pre>
      </div>
    </div>
  );
};

export default SdkSnippet;
