import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  title?: string;
  hint?: string;
  compact?: boolean;
}

function matches(file: File, accept: string): boolean {
  return accept.split(',').some((rule) => {
    const r = rule.trim().toLowerCase();
    if (!r) return false;
    if (r === '*' || r === '*/*') return true;
    if (r.startsWith('.')) return file.name.toLowerCase().endsWith(r);
    if (r.endsWith('/*')) return file.type.startsWith(r.slice(0, -1));
    return file.type === r;
  });
}

export function FileDrop({ accept, multiple = false, onFiles, title, hint, compact }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState(0);

  const handle = (list: FileList | null) => {
    if (!list) return;
    const all = [...list];
    const ok = all.filter((f) => matches(f, accept));
    setRejected(all.length - ok.length);
    if (ok.length) onFiles(multiple ? ok : ok.slice(0, 1));
  };

  return (
    <div
      className={`dropzone ${dragging ? 'dragging' : ''} ${compact ? 'compact' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
      onClick={() => input.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          input.current?.click();
        }
      }}
    >
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = '';
        }}
      />
      <Upload className="dropzone-icon" size={22} strokeWidth={1.6} />
      <div className="dropzone-title">
        {title ?? (
          <>
            Drop {multiple ? 'files' : 'a file'} here or <u>browse</u>
          </>
        )}
      </div>
      {hint && <div className="dropzone-hint">{hint}</div>}
      {rejected > 0 && <div className="dropzone-warn">{rejected} file(s) skipped — unsupported type</div>}
    </div>
  );
}
