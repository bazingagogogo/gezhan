import { useEffect, useRef, useState } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 4
const SCALE_STEP = 0.5

export default function ZoomableBoard({
  as: Tag = 'section',
  className = '',
  id,
  label,
  src,
  alt,
  eager = false,
}) {
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(MIN_SCALE)
  const stageRef = useRef(null)
  const dragRef = useRef(null)
  const clickTimerRef = useRef(null)
  const suppressClickRef = useRef(false)

  const resetView = () => {
    setScale(MIN_SCALE)
    requestAnimationFrame(() => stageRef.current?.scrollTo({ top: 0, left: 0, behavior: 'smooth' }))
  }

  const closeViewer = () => {
    setOpen(false)
    resetView()
  }

  const changeScale = (nextScale) => {
    const bounded = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale))
    setScale(bounded)
    if (bounded === MIN_SCALE) requestAnimationFrame(() => stageRef.current?.scrollTo({ top: 0, left: 0, behavior: 'smooth' }))
  }

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeViewer()
      if (event.key === '+' || event.key === '=') changeScale(scale + SCALE_STEP)
      if (event.key === '-') changeScale(scale - SCALE_STEP)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(clickTimerRef.current)
    }
  }, [open, scale])

  const onPointerDown = (event) => {
    if (scale <= MIN_SCALE) return
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event) => {
    if (!dragRef.current) return
    const deltaX = event.clientX - dragRef.current.x
    const deltaY = event.clientY - dragRef.current.y
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) dragRef.current.moved = true
    event.currentTarget.scrollLeft = dragRef.current.scrollLeft - deltaX
    event.currentTarget.scrollTop = dragRef.current.scrollTop - deltaY
  }

  const stopDragging = () => {
    if (dragRef.current?.moved) {
      suppressClickRef.current = true
      window.setTimeout(() => { suppressClickRef.current = false }, 0)
    }
    dragRef.current = null
  }
  const onStageClick = () => {
    if (suppressClickRef.current) return
    window.clearTimeout(clickTimerRef.current)
    clickTimerRef.current = window.setTimeout(closeViewer, 300)
  }
  const onStageDoubleClick = (event) => {
    event.preventDefault()
    window.clearTimeout(clickTimerRef.current)
    resetView()
  }
  const blockContextMenu = (event) => event.preventDefault()

  return (
    <>
      <Tag className={className} id={id} aria-label={label}>
        <button
          className="zoomable-board-trigger"
          type="button"
          aria-label={`放大查看：${alt}`}
          onClick={() => setOpen(true)}
          onContextMenu={blockContextMenu}
        >
          <img
            src={src}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            decoding="async"
            draggable="false"
          />
          <span className="zoomable-board-hint" aria-hidden="true">放大查看 <b>＋</b></span>
        </button>
      </Tag>

      {open && (
        <div className="board-viewer" role="dialog" aria-modal="true" aria-label={`图片查看器：${alt}`}>
          <div className="board-viewer-toolbar">
            <span>{Math.round(scale * 100)}%</span>
            <button type="button" onClick={() => changeScale(scale - SCALE_STEP)} disabled={scale <= MIN_SCALE} aria-label="缩小">−</button>
            <button type="button" onClick={resetView} aria-label="恢复原始比例">1:1</button>
            <button type="button" onClick={() => changeScale(scale + SCALE_STEP)} disabled={scale >= MAX_SCALE} aria-label="放大">＋</button>
            <button className="board-viewer-close" type="button" onClick={closeViewer} aria-label="关闭图片查看器">×</button>
          </div>
          <div
            ref={stageRef}
            className={`board-viewer-stage${scale > MIN_SCALE ? ' is-zoomed' : ''}`}
            onClick={onStageClick}
            onDoubleClick={onStageDoubleClick}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onContextMenu={blockContextMenu}
          >
            <img
              src={src}
              alt=""
              draggable="false"
              decoding="async"
              style={{ width: `${scale * 100}%` }}
            />
          </div>
          <p className="board-viewer-help">滚轮上下查看 · 单击关闭 · 双击恢复 · 放大后拖动查看</p>
        </div>
      )}
    </>
  )
}
