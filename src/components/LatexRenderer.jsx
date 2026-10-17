/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, memo } from 'react';

/**
 * 动态加载 MathJax 3 CDN 引擎
 */
export function useMathJaxEngine() {
  const [ready, setReady] = useState(() => Boolean(typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise));

  useEffect(() => {
    if (typeof window === 'undefined' || ready) return;

    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['[', ']']],
        processEscapes: true,
        processEnvironments: true
      },
      options: {
        skipHtmlTags: ['script', 'nosnippet', 'style', 'textarea', 'pre', 'code']
      },
      startup: {
        typeset: false
      }
    };

    if (!document.getElementById('mathjax-cdn-script')) {
      const script = document.createElement('script');
      script.id = 'mathjax-cdn-script';
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.onload = () => {
        queueMicrotask(() => setReady(true));
      };
      document.head.appendChild(script);
    } else {
      queueMicrotask(() => setReady(true));
    }
  }, [ready]);

  return ready;
}

/**
 * 深度预处理器：彻底清除导言区、净化排版指令、转译列表与文本格式
 */
export function parseLatexDocument(rawTex) {
  if (!rawTex) return [];
  let content = rawTex;

  const startIdx = content.indexOf('\\begin{document}');
  const endIdx = content.indexOf('\\end{document}');
  
  if (startIdx !== -1) {
    content = content.slice(startIdx + '\\begin{document}'.length, endIdx !== -1 ? endIdx : undefined);
  }

  content = content
    .replace(/^[ \t]*%.*$/gm, '')
    .replace(/\\title\{[^}]*\}/g, '')
    .replace(/\\author\{[^}]*\}/g, '')
    .replace(/\\date\{[^}]*\}/g, '')
    .replace(/\\maketitle/g, '')
    .replace(/\\tableofcontents/g, '')
    .replace(/\\newpage/g, '\n\n---\n\n')
    .replace(/\\markboth\{[^}]*\}\{[^}]*\}/g, '')
    .replace(/\\noindent\b/g, '')
    .replace(/\\begin\{figure\}([\s\S]*?)\\end\{figure\}/g, '\n\n*[Figure omitted]*\n\n');

  content = content.replace(/\\textbf\{([^}]+)\}/g, '<strong class="font-bold">$1</strong>');

  content = content.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (_, itemsText) => {
    const items = itemsText.split(/\\item\b/).map(i => i.trim()).filter(Boolean);
    return `<ul class="list-disc list-inside space-y-2 my-4 pl-2">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
  });

  const rawSections = content.split(/\\section\*?\{/);
  const sections = [];
  let secCounter = 0;

  if (rawSections[0].trim()) {
    sections.push({
      id: 'sec-intro',
      number: '00',
      title: 'Overview',
      level: 1,
      rawContent: rawSections[0]
    });
  }

  for (let i = 1; i < rawSections.length; i++) {
    secCounter++;
    const parts = rawSections[i].split('}');
    const title = parts[0].trim();
    const body = parts.slice(1).join('}');
    const numberStr = String(secCounter).padStart(2, '0');

    sections.push({
      id: `sec-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${numberStr}`,
      number: numberStr,
      title: title,
      level: 1,
      rawContent: body
    });
  }

  return sections;
}

/**
 * 块级渲染器：集成 MathJax 自动排版
 */
export const LatexAstBlockRenderer = memo(({ block, katexReady }) => {
  const content = block?.rawContent || block?.text || '';

  useEffect(() => {
    if (katexReady && window.MathJax && window.MathJax.typesetPromise) {
      const timer = setTimeout(() => {
        window.MathJax.typesetPromise().catch((err) => console.warn('MathJax typesetting failed:', err));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [content, katexReady]);

  return (
    <div 
      className="latex-rendered-content text-black max-w-none space-y-6"
      style={{
        fontFamily: '"Latin Modern Roman", "Computer Modern Serif", "Times New Roman", serif',
        fontSize: '1.05rem',
        lineHeight: '1.7'
      }}
      dangerouslySetInnerHTML={{ __html: formatTexToHtml(content) }}
    />
  );
});

function formatTexToHtml(tex) {
  let html = tex
    .replace(/\\begin\{proof\}([\s\S]*?)\\end\{proof\}/g, '<div class="my-6 italic font-bold">Proof.</div><div class="mb-4">$1<span class="float-right inline-block w-2.5 h-2.5 bg-black ml-4 mt-1.5"></span><div class="clear-both"></div></div>')
    .replace(/\\subsection\*?\{([^}]*)\}/g, '<h3 class="text-2xl font-semibold tracking-tight mt-8 mb-4">$1</h3>');

  return `<div class="space-y-4">${html}</div>`;
}