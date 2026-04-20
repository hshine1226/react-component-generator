import { useState } from 'react';
import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

interface LivePreviewProps {
  code: string;
}

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_SIZES: Record<Viewport, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
};

export function LivePreview({ code }: LivePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>미리보기</h3>
        <div className="viewport-buttons">
          <button
            className={`viewport-btn ${viewport === 'mobile' ? 'viewport-btn--active' : ''}`}
            onClick={() => setViewport('mobile')}
          >
            📱 모바일
          </button>
          <button
            className={`viewport-btn ${viewport === 'tablet' ? 'viewport-btn--active' : ''}`}
            onClick={() => setViewport('tablet')}
          >
            📊 태블릿
          </button>
          <button
            className={`viewport-btn ${viewport === 'desktop' ? 'viewport-btn--active' : ''}`}
            onClick={() => setViewport('desktop')}
          >
            🖥️ 데스크톱
          </button>
        </div>
      </div>
      <div className="preview-content">
        <LiveProvider code={code} noInline>
          <div className="preview-render" style={{ width: VIEWPORT_SIZES[viewport] }}>
            <ReactLivePreview />
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      </div>
    </div>
  );
}
