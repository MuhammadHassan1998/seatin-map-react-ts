import { Seat, Venue } from '@/types/venue.type'
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { PerformanceMonitor } from './PerformanceMonitor'

interface VenueMapProps {
  venueData: Venue
  selectedSeats: Seat[]
  handleSeatClick: (seat: Seat) => void
  setSelectedSeatDetails: (seat: Seat) => void
}

interface Viewport {
  x: number
  y: number
  scale: number
  width: number
  height: number
}

interface RenderStats {
  totalSeats: number
  renderedSeats: number
  fps: number
  renderTime: number
}

const VenueMap: React.FC<VenueMapProps> = ({
  venueData,
  selectedSeats,
  handleSeatClick,
  setSelectedSeatDetails
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>(null)
  const lastTimeRef = useRef<number>(0)

  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    scale: 1,
    width: 0,
    height: 0
  })

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null)

  const [stats, setStats] = useState<RenderStats>({
    totalSeats: 0,
    renderedSeats: 0,
    fps: 0,
    renderTime: 0
  })

  const seatData = useMemo(() => {
    const seats: Array<{
      seat: Seat
      section: any
      worldX: number
      worldY: number
      screenX: number
      screenY: number
    }> = []

    venueData.sections.forEach(section => {
      section.rows.forEach(row => {
        row.seats.forEach(seat => {
          const worldX = section.transform.x + seat.x * section.transform.scale
          const worldY = section.transform.y + seat.y * section.transform.scale

          seats.push({
            seat,
            section,
            worldX,
            worldY,
            screenX: 0,
            screenY: 0
          })
        })
      })
    })

    return seats
  }, [venueData])

  useEffect(() => {
    setStats(prev => ({ ...prev, totalSeats: seatData.length }))
  }, [seatData.length])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }

      setViewport(prev => ({
        ...prev,
        width: rect.width,
        height: rect.height
      }))
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const worldToScreen = useCallback(
    (worldX: number, worldY: number): [number, number] => {
      const screenX =
        (worldX - viewport.x) * viewport.scale + viewport.width / 2
      const screenY =
        (worldY - viewport.y) * viewport.scale + viewport.height / 2
      return [screenX, screenY]
    },
    [viewport]
  )

  const screenToWorld = useCallback(
    (screenX: number, screenY: number): [number, number] => {
      const worldX =
        (screenX - viewport.width / 2) / viewport.scale + viewport.x
      const worldY =
        (screenY - viewport.height / 2) / viewport.scale + viewport.y
      return [worldX, worldY]
    },
    [viewport]
  )

  const getSeatColor = useCallback(
    (seat: Seat, isSelected: boolean, isHovered: boolean) => {
      if (isHovered) return '#3B82F6' 
      if (isSelected) return '#1E40AF' 

      switch (seat.status) {
        case 'available':
          return '#10B981' 
        case 'reserved':
          return '#F59E0B'
        case 'sold':
          return '#EF4444'
        case 'held':
          return '#F97316' 
        default:
      }
    },
    []
  )

  const getVisibleSeats = useCallback(() => {
    const margin = 100 
    const [minX, minY] = screenToWorld(-margin, -margin)
    const [maxX, maxY] = screenToWorld(
      viewport.width + margin,
      viewport.height + margin
    )

    return seatData.filter(
      ({ worldX, worldY }) =>
        worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY
    )
  }, [seatData, viewport, screenToWorld])

  const getSeatSize = useCallback((scale: number) => {
    if (scale < 0.5) return 2 
    if (scale < 1) return 4 
    if (scale < 2) return 8
    return 12
  }, [])

  const render = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const startTime = performance.now()

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.save()
      ctx.translate(viewport.width / 2, viewport.height / 2)
      ctx.scale(viewport.scale, viewport.scale)
      ctx.translate(-viewport.x, -viewport.y)

      const visibleSeats = getVisibleSeats()

      const seatSize = getSeatSize(viewport.scale)
      const shouldRenderLabels = viewport.scale > 1.5

      visibleSeats.forEach(({ seat, worldX, worldY }) => {
        const isSelected = selectedSeats.some(s => s.id === seat.id)
        const isHovered = hoveredSeat?.id === seat.id

        ctx.beginPath()
        ctx.arc(worldX, worldY, seatSize, 0, 2 * Math.PI)
        ctx.fillStyle = getSeatColor(seat, isSelected, isHovered)
        ctx.fill()

        if (isSelected || isHovered) {
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 2
          ctx.stroke()
        }

        if (shouldRenderLabels && seatSize > 6) {
          ctx.fillStyle = '#000000'
          ctx.font = `${Math.max(8, seatSize)}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(seat.id, worldX, worldY)
        }
      })

      ctx.restore()

      const renderTime = performance.now() - startTime
      const fps =
        timestamp - lastTimeRef.current > 0
          ? 1000 / (timestamp - lastTimeRef.current)
          : 0
      lastTimeRef.current = timestamp

      setStats({
        totalSeats: seatData.length,
        renderedSeats: visibleSeats.length,
        fps: Math.round(fps),
        renderTime: Math.round(renderTime)
      })

      animationFrameRef.current = requestAnimationFrame(render)
    },
    [
      viewport,
      seatData,
      selectedSeats,
      hoveredSeat,
      getVisibleSeats,
      getSeatSize,
      getSeatColor
    ]
  )

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render)
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [render])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      setViewport(prev => ({
        ...prev,
        x: prev.x - deltaX / prev.scale,
        y: prev.y - deltaY / prev.scale
      }))

      setDragStart({ x: e.clientX, y: e.clientY })
    },
    [isDragging, dragStart]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()

      const rect = e.currentTarget.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const [worldX, worldY] = screenToWorld(mouseX, mouseY)

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.1, Math.min(5, viewport.scale * zoomFactor))

      const scaleRatio = newScale / viewport.scale
      const newX = worldX - (worldX - viewport.x) * scaleRatio
      const newY = worldY - (worldY - viewport.y) * scaleRatio

      setViewport(prev => ({
        ...prev,
        scale: newScale,
        x: newX,
        y: newY
      }))
    },
    [viewport, screenToWorld]
  )

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      const [worldX, worldY] = screenToWorld(clickX, clickY)

      const clickedSeat = seatData.find(({ worldX: seatX, worldY: seatY }) => {
        const distance = Math.sqrt(
          (seatX - worldX) ** 2 + (seatY - worldY) ** 2
        )
        return distance <= getSeatSize(viewport.scale)
      })

      if (clickedSeat) {
        handleSeatClick(clickedSeat.seat)
        setSelectedSeatDetails(clickedSeat.seat)
      }
    },
    [
      seatData,
      viewport,
      screenToWorld,
      getSeatSize,
      handleSeatClick,
      setSelectedSeatDetails
    ]
  )

  const handleMouseMoveForHover = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return

      const rect = e.currentTarget.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const [worldX, worldY] = screenToWorld(mouseX, mouseY)

      const hovered = seatData.find(({ worldX: seatX, worldY: seatY }) => {
        const distance = Math.sqrt(
          (seatX - worldX) ** 2 + (seatY - worldY) ** 2
        )
        return distance <= getSeatSize(viewport.scale)
      })

      setHoveredSeat(hovered?.seat || null)
    },
    [seatData, viewport, screenToWorld, getSeatSize, isDragging]
  )

  const resetView = useCallback(() => {
    if (seatData.length === 0) return

    const bounds = seatData.reduce(
      (acc, { worldX, worldY }) => ({
        minX: Math.min(acc.minX, worldX),
        maxX: Math.max(acc.maxX, worldX),
        minY: Math.min(acc.minY, worldY),
        maxY: Math.max(acc.maxY, worldY)
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    )

    const centerX = (bounds.minX + bounds.maxX) / 2
    const centerY = (bounds.minY + bounds.maxY) / 2

    const width = bounds.maxX - bounds.minX
    const height = bounds.maxY - bounds.minY

    const scale = Math.min(
      (viewport.width - 200) / width,
      (viewport.height - 200) / height
    )

    console.log('Venue bounds:', bounds)
    console.log('Venue center:', { centerX, centerY })
    console.log('Venue dimensions:', { width, height })
    console.log('Calculated scale:', scale)

    setViewport(prev => ({
      ...prev,
      x: centerX,
      y: centerY,
      scale: Math.min(scale, 1)
    }))
  }, [seatData, viewport.width, viewport.height])

  useEffect(() => {
    if (seatData.length > 0 && viewport.width > 0 && viewport.height > 0) {
      resetView()
    }
  }, [seatData, viewport.width, viewport.height, resetView])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const panAmount = 100 / viewport.scale

      switch (e.key) {
        case 'ArrowUp':
          setViewport(prev => ({ ...prev, y: prev.y - panAmount }))
          break
        case 'ArrowDown':
          setViewport(prev => ({ ...prev, y: prev.y + panAmount }))
          break
        case 'ArrowLeft':
          setViewport(prev => ({ ...prev, x: prev.x - panAmount }))
          break
        case 'ArrowRight':
          setViewport(prev => ({ ...prev, x: prev.x + panAmount }))
          break
        case '0':
          resetView()
          break
        case '+':
        case '=':
          setViewport(prev => ({
            ...prev,
            scale: Math.min(5, prev.scale * 1.2)
          }))
          break
        case '-':
          setViewport(prev => ({
            ...prev,
            scale: Math.max(0.1, prev.scale / 1.2)
          }))
          break
      }
    },
    [viewport.scale, resetView]
  )

  return (
    <div className='relative w-full h-full'>
      <PerformanceMonitor stats={stats} />
      <div
        ref={containerRef}
        className='relative w-full h-full border border-gray-300 rounded-lg bg-white overflow-hidden'
      >
        <canvas
          ref={canvasRef}
          className='w-full h-full cursor-grab active:cursor-grabbing'
          onMouseDown={handleMouseDown}
          onMouseMove={e => {
            handleMouseMove(e)
            handleMouseMoveForHover(e)
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role='application'
          aria-label='Interactive seating map for venue'
        />
      </div>
    </div>
  )
}

export default VenueMap
