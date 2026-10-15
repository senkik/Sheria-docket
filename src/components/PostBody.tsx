import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PostBodyProps {
  content: string | null;
}

export function PostBody({ content }: PostBodyProps) {
  if (!content) {
    return <p className="text-sm text-muted-foreground">This article has no body text yet.</p>;
  }

  return (
    <div className="article-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
