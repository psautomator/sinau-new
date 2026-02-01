"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
    if (!content) return null;

    // Pre-process content to handle the case where single newlines are intended as paragraphs
    // but without breaking lists, tables, or other block elements.
    // 1. Normalize line endings
    // 2. Ensure blank lines between common line-based formats like dialogue or bold headers
    const processedContent = content
        .replace(/\r\n/g, "\n")
        // Add double newline between lines that look like list items and text, or dialogue lines
        .replace(/([^\n])\n([^\n*-])/g, "$1\n\n$2")
        // Ensure HRs have space (already handled by prose-hr but this helps matching)
        .replace(/\n---\n/g, "\n\n---\n\n");

    return (
        <div className="prose prose-lg dark:prose-invert max-w-none 
            prose-headings:text-primary prose-headings:font-bold prose-headings:mb-8 prose-headings:mt-12
            prose-p:text-text-secondary-light dark:prose-p:text-text-secondary-dark prose-p:leading-relaxed prose-p:mb-10
            prose-a:text-primary hover:prose-a:text-primary-dark 
            prose-strong:text-text-main-light dark:prose-strong:text-text-main-dark 
            prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-8 prose-li:mb-4
            prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-purple-50 dark:prose-code:bg-purple-900/20 prose-code:px-1 prose-code:rounded
            prose-pre:bg-gray-900 prose-pre:text-gray-50 prose-pre:rounded-xl prose-pre:p-4 prose-pre:my-10
            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-12
            prose-table:w-full prose-table:my-10 prose-th:text-left prose-th:p-4 prose-th:bg-gray-50 dark:prose-th:bg-gray-800/50 prose-td:p-4 prose-tr:border-b dark:prose-tr:border-gray-800
            prose-hr:border-slate-300 dark:prose-hr:border-slate-700 prose-hr:my-16 prose-hr:border-t-4
        ">
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
}
