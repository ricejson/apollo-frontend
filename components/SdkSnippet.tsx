
import React, { useState } from 'react';

const SdkSnippet: React.FC<{ toggleKey: string }> = ({ toggleKey }) => {
  const [lang, setLang] = useState<'java' | 'go' | 'js' | 'c#'>('js');

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
    go: `package main

import (
	"context"
	"github.com/ricejson/apollo-sdk-go/client"
	"github.com/ricejson/apollo-sdk-go/model"
)

func main() {
	// 创建客户端实例
	client := client.NewClient()
	// 构造condition
	user := model.NewUser().
		With("user_id", "123").
		With("city", "Beijing")
	// 获取结果
	allow, err := client.IsToggleAllowV2(context.Background(), "tg_wri5tl24n", "123", user)
	if err != nil {
		// 处理错误逻辑
	}
	if allow {
		// 执行业务操作
	}
}
`,
csharp:`ApolloClient client = new(new ApolloOptions
{
    TogglesPath = Path.Combine(Environment.CurrentDirectory, "toggles")
});

var context = new ApolloContext("user_123")
    .Set("city", "Beijing");

if (client.IsToggleAllowed("smart_recommender_v2", context))
{
    Console.WriteLine("is allow");
}`
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden text-sm font-mono mt-8 border border-gray-700 shadow-xl">
      <div className="flex bg-gray-800 px-4 pt-3 gap-4">
        {(['js', 'java', 'go', 'csharp'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`pb-2 px-1 transition-all capitalize ${lang === l ? 'text-blue-400 border-b-2 border-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {l === 'js' ? 'JavaScript' : l === 'java' ? 'Java' : l === 'go' ? 'Go' : 'C#'}
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
