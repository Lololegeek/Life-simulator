import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft } from 'lucide-react';
import { GUIDE } from './guide.md';

export const metadata = { title: 'Guide — 1 sur 8 milliards' };

export default function GuidePage() {
  return (
    <main className="min-h-dvh px-5 py-10">
      <article className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour au jeu
        </Link>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: (p) => <h1 className="mb-4 font-display text-3xl font-extrabold sm:text-4xl" {...p} />,
            h2: (p) => <h2 className="mb-2 mt-8 font-display text-xl font-bold" {...p} />,
            p: (p) => <p className="my-3 leading-relaxed text-foreground/85" {...p} />,
            ul: (p) => <ul className="my-3 list-disc space-y-1 pl-6" {...p} />,
            ol: (p) => <ol className="my-3 list-decimal space-y-1 pl-6" {...p} />,
            table: (p) => <div className="my-4 overflow-x-auto"><table className="w-full text-sm" {...p} /></div>,
            th: (p) => <th className="border-b border-border px-3 py-2 text-left font-semibold" {...p} />,
            td: (p) => <td className="border-b border-border px-3 py-2" {...p} />,
            blockquote: (p) => <blockquote className="my-6 rounded-xl border-l-4 border-primary bg-primary/5 px-4 py-3" {...p} />,
          }}
        >
          {GUIDE}
        </ReactMarkdown>
      </article>
    </main>
  );
}
