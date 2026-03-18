import { useState, useCallback, useRef, useEffect } from 'react';
import type { CaseStudy } from '../types';
import styles from './CaseStudyPanel.module.css';

interface Props {
  caseStudy: CaseStudy;
}

export function CaseStudyPanel({ caseStudy }: Props) {
  const [activeSectionId, setActiveSectionId] = useState(caseStudy.sections[0]?.id ?? '');
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());

  const activeSection = caseStudy.sections.find((s) => s.id === activeSectionId);

  const toggleSub = useCallback((subId: string) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
  }, []);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>{caseStudy.title}</div>
      <ul className={styles.menu} role="tablist" aria-label="ケーススタディセクション">
        {caseStudy.sections.map((section) => (
          <li
            key={section.id}
            role="tab"
            aria-selected={section.id === activeSectionId}
            className={`${styles.menuItem} ${section.id === activeSectionId ? styles.menuItemActive : ''}`}
            onClick={() => setActiveSectionId(section.id)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveSectionId(section.id);
              }
            }}
          >
            {section.title}
          </li>
        ))}
      </ul>
      <div className={styles.content} role="tabpanel">
        {activeSection && (
          <>
            {activeSection.content && (
              <div dangerouslySetInnerHTML={{ __html: activeSection.content }} />
            )}
            {activeSection.subSections?.map((sub) => (
              <div key={sub.id} className={styles.subSection}>
                <button
                  className={styles.subSectionToggle}
                  onClick={() => toggleSub(sub.id)}
                  aria-expanded={expandedSubs.has(sub.id)}
                >
                  <span
                    className={`${styles.subSectionArrow} ${expandedSubs.has(sub.id) ? styles.subSectionArrowOpen : ''}`}
                  >
                    ▶
                  </span>
                  {sub.title}
                </button>
                {expandedSubs.has(sub.id) && (
                  <div
                    className={styles.subSectionContent}
                    dangerouslySetInnerHTML={{ __html: sub.content }}
                  />
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* Wrapper that adds resize functionality with mouse + touch support */
interface ResizableProps {
  caseStudy: CaseStudy;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
}

export function ResizableCaseStudyPanel({
  caseStudy,
  minWidth = 240,
  maxWidth = 600,
  defaultWidth = 360,
}: ResizableProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dragging) return;

    const clamp = (x: number) => {
      if (!containerRef.current) return width;
      const rect = containerRef.current.getBoundingClientRect();
      return Math.min(maxWidth, Math.max(minWidth, x - rect.left));
    };

    const onMouseMove = (e: MouseEvent) => setWidth(clamp(e.clientX));
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) setWidth(clamp(e.touches[0].clientX));
    };
    const stop = () => setDragging(false);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stop);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', stop);
    document.addEventListener('touchcancel', stop);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', stop);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', stop);
      document.removeEventListener('touchcancel', stop);
    };
  }, [dragging, minWidth, maxWidth, width]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = 20;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setWidth((w) => Math.min(maxWidth, w + step));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setWidth((w) => Math.max(minWidth, w - step));
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width, flexShrink: 0, height: '100%' }}>
      <CaseStudyPanel caseStudy={caseStudy} />
      <div
        className={`${styles.resizer} ${dragging ? styles.resizerActive : ''}`}
        onMouseDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
        onKeyDown={onKeyDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="パネル幅を調整"
        aria-valuenow={width}
        aria-valuemin={minWidth}
        aria-valuemax={maxWidth}
        tabIndex={0}
      />
    </div>
  );
}
