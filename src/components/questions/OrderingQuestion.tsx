import { useRef, useState, useCallback } from 'react';
import type { Question, UserAnswer, OrderItem } from '../../types';
import styles from './Questions.module.css';

interface Props {
  question: Question;
  answer: UserAnswer | undefined;
  onAnswer: (answer: UserAnswer) => void;
}

export function OrderingQuestion({ question, answer, onAnswer }: Props) {
  const items: OrderItem[] = question.orderItems ?? [];
  const requiredCount = question.requiredSelections ?? items.length;
  const needsSelection = requiredCount < items.length;

  const orderedIds: string[] =
    answer?.type === 'ordering' ? answer.orderedIds : [];

  // Items selected for ordering
  const selectedItems = orderedIds
    .map((id) => items.find((i) => i.id === id))
    .filter((i): i is OrderItem => !!i);

  // Items not yet selected (available pool)
  const selectedSet = new Set(orderedIds);
  const availableItems = items.filter((i) => !selectedSet.has(i.id));

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const dragNode = useRef<HTMLLIElement | null>(null);

  const swap = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= orderedIds.length) return;
      const next = [...orderedIds];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onAnswer({ type: 'ordering', orderedIds: next });
    },
    [orderedIds, onAnswer],
  );

  const addItem = (id: string) => {
    if (orderedIds.length >= requiredCount) return;
    onAnswer({ type: 'ordering', orderedIds: [...orderedIds, id] });
  };

  const removeItem = (id: string) => {
    onAnswer({ type: 'ordering', orderedIds: orderedIds.filter((x) => x !== id) });
  };

  // HTML5 drag & drop
  const handleDragStart = (idx: number, e: React.DragEvent<HTMLLIElement>) => {
    setDragIdx(idx);
    dragNode.current = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    swap(dragIdx, idx);
    setDragIdx(idx);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    dragNode.current = null;
  };

  // Touch drag support
  const touchIdx = useRef<number | null>(null);

  const handleTouchStart = (idx: number) => {
    touchIdx.current = idx;
    setDragIdx(idx);
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchIdx.current === null) return;
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!el) return;
      const li = el.closest('li');
      if (!li?.dataset.idx) return;
      const overIdx = Number(li.dataset.idx);
      if (overIdx !== touchIdx.current) {
        swap(touchIdx.current, overIdx);
        touchIdx.current = overIdx;
        setDragIdx(overIdx);
      }
    },
    [swap],
  );

  const handleTouchEnd = () => {
    touchIdx.current = null;
    setDragIdx(null);
  };

  // Simple ordering (all items, no selection needed)
  if (!needsSelection) {
    const allOrderedIds = orderedIds.length > 0 ? orderedIds : items.map((i) => i.id);
    const allOrderedItems = allOrderedIds
      .map((id) => items.find((i) => i.id === id))
      .filter((i): i is OrderItem => !!i);

    const swapAll = (from: number, to: number) => {
      if (to < 0 || to >= allOrderedIds.length) return;
      const next = [...allOrderedIds];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onAnswer({ type: 'ordering', orderedIds: next });
    };

    return (
      <ul className={styles.orderList} aria-label="並べ替えリスト">
        {allOrderedItems.map((item, idx) => (
          <li
            key={item.id}
            data-idx={idx}
            draggable
            onDragStart={(e) => handleDragStart(idx, e)}
            onDragOver={(e) => handleDragOver(idx, e)}
            onDragEnd={handleDragEnd}
            onTouchStart={() => handleTouchStart(idx)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`${styles.orderItem} ${dragIdx === idx ? styles.orderItemDragging : ''}`}
          >
            <span className={styles.orderNumber}>{idx + 1}</span>
            <span className={styles.orderGrip} aria-hidden="true">⠿</span>
            <span className={styles.orderText}>{item.text}</span>
            <span className={styles.orderButtons}>
              <button
                className={styles.orderBtn}
                disabled={idx === 0}
                onClick={() => swapAll(idx, idx - 1)}
                aria-label={`${item.text} を上に移動`}
              >▲</button>
              <button
                className={styles.orderBtn}
                disabled={idx === allOrderedItems.length - 1}
                onClick={() => swapAll(idx, idx + 1)}
                aria-label={`${item.text} を下に移動`}
              >▼</button>
            </span>
          </li>
        ))}
      </ul>
    );
  }

  // Selection + ordering mode
  return (
    <div>
      <p className={styles.requiredNote}>
        {items.length}個の選択肢から{requiredCount}個を選んで正しい順番に並べ替えてください
      </p>

      {/* Available items pool */}
      {availableItems.length > 0 && (
        <div className={styles.orderPool}>
          <p className={styles.orderPoolLabel}>選択肢（クリックで追加）</p>
          <ul className={styles.orderPoolList}>
            {availableItems.map((item) => (
              <li key={item.id}>
                <button
                  className={styles.orderPoolItem}
                  onClick={() => addItem(item.id)}
                  disabled={orderedIds.length >= requiredCount}
                  aria-label={`${item.text} を追加`}
                >
                  <span className={styles.orderPoolId}>{item.id}</span>
                  <span>{item.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected & ordered items */}
      <div className={styles.orderSelectedArea}>
        <p className={styles.orderPoolLabel}>
          並べ替え順（{selectedItems.length}/{requiredCount}）
        </p>
        {selectedItems.length === 0 ? (
          <p className={styles.orderEmptyHint}>上の選択肢をクリックして追加してください</p>
        ) : (
          <ul className={styles.orderList} aria-label="並べ替えリスト">
            {selectedItems.map((item, idx) => (
              <li
                key={item.id}
                data-idx={idx}
                draggable
                onDragStart={(e) => handleDragStart(idx, e)}
                onDragOver={(e) => handleDragOver(idx, e)}
                onDragEnd={handleDragEnd}
                onTouchStart={() => handleTouchStart(idx)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`${styles.orderItem} ${dragIdx === idx ? styles.orderItemDragging : ''}`}
              >
                <span className={styles.orderNumber}>{idx + 1}</span>
                <span className={styles.orderGrip} aria-hidden="true">⠿</span>
                <span className={styles.orderText}>{item.text}</span>
                <span className={styles.orderButtons}>
                  <button
                    className={styles.orderBtn}
                    disabled={idx === 0}
                    onClick={() => swap(idx, idx - 1)}
                    aria-label={`${item.text} を上に移動`}
                  >▲</button>
                  <button
                    className={styles.orderBtn}
                    disabled={idx === selectedItems.length - 1}
                    onClick={() => swap(idx, idx + 1)}
                    aria-label={`${item.text} を下に移動`}
                  >▼</button>
                  <button
                    className={styles.orderBtnRemove}
                    onClick={() => removeItem(item.id)}
                    aria-label={`${item.text} を削除`}
                  >✕</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
