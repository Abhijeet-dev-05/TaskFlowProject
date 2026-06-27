import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ content }) {
    if (!content) return null;

    // Parse the content to split code blocks and text
    const blocks = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        // Add text before the code block
        if (match.index > lastIndex) {
            blocks.push({
                type: 'text',
                content: content.slice(lastIndex, match.index)
            });
        }

        // Add the code block
        blocks.push({
            type: 'code',
            language: match[1] || 'text',
            content: match[2].trim()
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last code block
    if (lastIndex < content.length) {
        blocks.push({
            type: 'text',
            content: content.slice(lastIndex)
        });
    }

    return (
        <div className="space-y-3">
            {blocks.map((block, idx) => {
                if (block.type === 'code') {
                    return <CodeSnippet key={idx} language={block.language} code={block.content} />;
                }
                
                // Format plain text: split by newlines for paragraphs
                const paragraphs = block.content.split('\n').filter(p => p.trim());
                return (
                    <div key={idx} className="space-y-1">
                        {paragraphs.map((p, i) => (
                            <p key={i} className="text-sm text-gray-900 dark:text-zinc-200 leading-relaxed">
                                {p}
                            </p>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

function CodeSnippet({ language, code }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-3 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-[#1e1e1e] shadow-sm">
            <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 font-medium uppercase tracking-wider">
                    {language || 'text'}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded"
                    title="Copy code"
                >
                    {copied ? (
                        <><Check className="size-3.5 text-emerald-500" /> <span className="text-emerald-500">Copied!</span></>
                    ) : (
                        <><Copy className="size-3.5" /> <span>Copy</span></>
                    )}
                </button>
            </div>
            <div className="p-4 overflow-x-auto no-scrollbar">
                <pre className="text-sm font-mono leading-relaxed text-zinc-300">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
}
