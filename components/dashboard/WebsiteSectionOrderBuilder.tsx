'use client'

import { useMemo, useState } from 'react'
import type { PublicSiteSectionKey } from '@/types/public-site'

type SectionItem = {
  key: PublicSiteSectionKey
  label: string
}

type WebsiteSectionOrderBuilderProps = {
  defaultOrder: PublicSiteSectionKey[]
  labels: Record<PublicSiteSectionKey, string>
  inputName: string
}

const DEFAULT_ORDER: PublicSiteSectionKey[] = ['about', 'offerings', 'gallery', 'team', 'hours', 'contact']

function normalizeOrder(order: PublicSiteSectionKey[]) {
  const allowed = new Set<PublicSiteSectionKey>(DEFAULT_ORDER)
  const deduped = Array.from(new Set(order.filter((item) => allowed.has(item))))
  return deduped.length === DEFAULT_ORDER.length ? deduped : DEFAULT_ORDER
}

export default function WebsiteSectionOrderBuilder({ defaultOrder, labels, inputName }: WebsiteSectionOrderBuilderProps) {
  const [order, setOrder] = useState<PublicSiteSectionKey[]>(normalizeOrder(defaultOrder))
  const [draggingKey, setDraggingKey] = useState<PublicSiteSectionKey | null>(null)

  const items = useMemo<SectionItem[]>(() => order.map((key) => ({ key, label: labels[key] })), [order, labels])

  function moveItem(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) {
      return
    }

    const next = [...order]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setOrder(next)
  }

  function handleDrop(targetKey: PublicSiteSectionKey) {
    if (!draggingKey || draggingKey === targetKey) {
      setDraggingKey(null)
      return
    }

    const from = order.indexOf(draggingKey)
    const to = order.indexOf(targetKey)
    moveItem(from, to)
    setDraggingKey(null)
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={inputName} value={JSON.stringify(order)} readOnly />
      {items.map((item, index) => (
        <div
          key={item.key}
          draggable
          onDragStart={() => setDraggingKey(item.key)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(item.key)}
          onDragEnd={() => setDraggingKey(null)}
          className="flex items-center justify-between gap-3 rounded-md border border-loom-border bg-loom-white px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-loom-muted">⋮⋮</span>
            <span className="text-sm text-loom-black">{item.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded border border-loom-border px-2 py-1 text-xs text-loom-black disabled:opacity-40"
              onClick={() => moveItem(index, index - 1)}
              disabled={index === 0}
            >
              ↑
            </button>
            <button
              type="button"
              className="rounded border border-loom-border px-2 py-1 text-xs text-loom-black disabled:opacity-40"
              onClick={() => moveItem(index, index + 1)}
              disabled={index === items.length - 1}
            >
              ↓
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
