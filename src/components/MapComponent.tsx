'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import {
  Cafe,
  getCafeCoordinates,
  isCafeRoastery,
  isCafe24Hours,
  getCafeImages,
} from '@/lib/data'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import { ChevronLeft, ChevronRight, Clock, MapPin, LocateFixed, Bookmark } from 'lucide-react'

interface MapComponentProps {
  cafes: Cafe[]
  selectedCafe: Cafe | null
  onSelectCafe: (cafe: Cafe) => void
  mapCenter?: [number, number] | null
  userLocation?: [number, number] | null
  onRequestUserLocation?: () => void
  isLoggedIn?: boolean
  isBookmarked?: (cafeId: string) => boolean
  onToggleBookmark?: (cafeId: string) => void
}

// Recenter component when selectedCafe or mapCenter changes
function MapController({
  selectedCafe,
  mapCenter,
  onZoomChange,
  onMapMove,
}: {
  selectedCafe: Cafe | null
  mapCenter?: [number, number] | null
  onZoomChange: (zoom: number) => void
  onMapMove: (map: L.Map) => void
}) {
  const map = useMap()

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom())
      onMapMove(map)
    },
    move: () => {
      onMapMove(map)
    },
  })

  useEffect(() => {
    onMapMove(map)
  }, [map, onMapMove])

  useEffect(() => {
    if (selectedCafe) {
      const coords = getCafeCoordinates(selectedCafe)
      map.setView(coords, Math.max(map.getZoom(), 14), { animate: true })
    }
  }, [selectedCafe, map])

  useEffect(() => {
    if (mapCenter) {
      map.setView(mapCenter, 14, { animate: true })
    }
  }, [mapCenter, map])

  return null
}

// Calculate marker size inversely with zoom: farther out = relatively larger
function getMarkerSizeForZoom(zoom: number, isSelected: boolean): number {
  let base = 38
  if (zoom <= 9) base = 72
  else if (zoom === 10) base = 66
  else if (zoom === 11) base = 60
  else if (zoom === 12) base = 54
  else if (zoom === 13) base = 48
  else if (zoom === 14) base = 42
  else base = 38

  return isSelected ? base + 8 : base
}

// Animated GIF-style SVG marker generator for Coffee Bean (Roastery) & Coffee Cup (Cafe)
const createAnimatedCafeIcon = (
  isRoastery: boolean,
  isOpen: boolean,
  isSelected: boolean,
  size: number
) => {
  const bgColor = isSelected ? '#111111' : isOpen ? '#222222' : '#555555'
  const borderColor = isSelected ? '#222222' : '#FFFFFF'
  const innerSize = Math.round(size * 0.58)
  const animClass = isOpen ? (isRoastery ? 'marker-roasting-bean' : 'marker-steaming-cup') : ''

  // Roasting waves (for open roasteries) or rising steam wisps (for open cafes)
  const topEffectHtml = isOpen
    ? isRoastery
      ? `
        <div class="roast-waves" style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); display:flex; gap:3px; pointer-events:none;">
          <span class="roast-wave w1"></span>
          <span class="roast-wave w2"></span>
          <span class="roast-wave w3"></span>
        </div>
      `
      : `
        <div class="cup-steam" style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); display:flex; gap:3px; pointer-events:none;">
          <span class="steam-wisp s1"></span>
          <span class="steam-wisp s2"></span>
        </div>
      `
    : ''

  // Coffee Bean SVG vs Coffee Cup SVG
  const iconSvg = isRoastery
    ? `
      <svg viewBox="0 0 64 64" width="${innerSize}" height="${innerSize}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="32" rx="22" ry="16" transform="rotate(-28 32 32)" fill="#FFFFFF" />
        <path d="M16 40 C24 28, 40 36, 48 24" stroke="${bgColor}" stroke-width="4.5" stroke-linecap="round" fill="none" />
      </svg>
    `
    : `
      <svg viewBox="0 0 64 64" width="${innerSize}" height="${innerSize}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 22 H44 V36 C44 44.8 36.8 52 28 52 H26 C19.4 52 14 46.6 14 40 V22 Z" fill="#FFFFFF" />
        <path d="M44 26 H49 C52.9 26 56 29.1 56 33 C56 36.9 52.9 40 49 40 H44" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" />
        <line x1="12" y1="56" x2="46" y2="56" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
      </svg>
    `

  // Red "X" overlay right on top of the bean/cup when closed
  const closedXOverlay = !isOpen
    ? `
      <div style="
        position:absolute;
        inset:0;
        display:flex;
        align-items:center;
        justify-content:center;
        pointer-events:none;
      ">
        <svg viewBox="0 0 64 64" width="${Math.round(size * 0.78)}" height="${Math.round(size * 0.78)}" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="14" y1="14" x2="50" y2="50" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" />
          <line x1="50" y1="14" x2="14" y2="50" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" />
          <line x1="14" y1="14" x2="50" y2="50" stroke="#EF4444" stroke-width="5.5" stroke-linecap="round" />
          <line x1="50" y1="14" x2="14" y2="50" stroke="#EF4444" stroke-width="5.5" stroke-linecap="round" />
        </svg>
      </div>
    `
    : ''

  return L.divIcon({
    className: 'custom-animated-cafe-marker',
    html: `
      <div class="marker-outer-wrapper ${animClass}" style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        background-color: ${bgColor};
        border: 2.5px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${isSelected ? '0 0 0 3px #FFFFFF, 0 6px 16px rgba(0,0,0,0.45)' : '0 4px 10px rgba(0,0,0,0.28)'};
        cursor: pointer;
      ">
        ${topEffectHtml}
        ${iconSvg}
        ${closedXOverlay}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function MapComponent({
  cafes,
  selectedCafe,
  onSelectCafe,
  mapCenter,
  userLocation,
  onRequestUserLocation,
  isLoggedIn = false,
  isBookmarked,
  onToggleBookmark,
}: MapComponentProps) {
  const [zoom, setZoom] = useState(14)
  const [hoveredCafe, setHoveredCafe] = useState<Cafe | null>(null)
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null)
  const [carouselIdx, setCarouselIdx] = useState(0)
  const mapRef = useRef<L.Map | null>(null)
  const closeHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const initialCenter: [number, number] =
    mapCenter ||
    (selectedCafe ? getCafeCoordinates(selectedCafe) : [8.4772, 124.6459])

  const updateHoverPosition = useCallback(
    (mapInstance: L.Map) => {
      mapRef.current = mapInstance
      if (hoveredCafe) {
        const coords = getCafeCoordinates(hoveredCafe)
        const pt = mapInstance.latLngToContainerPoint(coords)
        setHoverPoint({ x: pt.x, y: pt.y })
      }
    },
    [hoveredCafe]
  )

  const handleMarkerMouseOver = (cafe: Cafe) => {
    if (closeHoverTimeoutRef.current) {
      clearTimeout(closeHoverTimeoutRef.current)
      closeHoverTimeoutRef.current = null
    }
    if (hoveredCafe?.id !== cafe.id) {
      setCarouselIdx(0)
    }
    setHoveredCafe(cafe)
    if (mapRef.current) {
      const coords = getCafeCoordinates(cafe)
      const pt = mapRef.current.latLngToContainerPoint(coords)
      setHoverPoint({ x: pt.x, y: pt.y })
    }
  }

  const handleMarkerMouseOut = () => {
    closeHoverTimeoutRef.current = setTimeout(() => {
      setHoveredCafe(null)
      setHoverPoint(null)
    }, 220)
  }

  const handleTooltipMouseEnter = () => {
    if (closeHoverTimeoutRef.current) {
      clearTimeout(closeHoverTimeoutRef.current)
      closeHoverTimeoutRef.current = null
    }
  }

  const handleTooltipMouseLeave = () => {
    setHoveredCafe(null)
    setHoverPoint(null)
  }

  // Auto-advance hover tooltip image carousel like a smooth GIF preview
  useEffect(() => {
    if (!hoveredCafe) return
    const imgs = getCafeImages(hoveredCafe)
    if (imgs.length <= 1) return
    const timer = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % imgs.length)
    }, 2200)
    return () => clearInterval(timer)
  }, [hoveredCafe])

  const hoverImages = hoveredCafe ? getCafeImages(hoveredCafe) : []

  return (
    <div className="w-full h-full relative">
      {/* Dynamic CSS for Leaflet & GIF-like Roasting Bean / Steaming Cup animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .leaflet-bar {
          border-radius: 0px !important;
          border: 1px solid #E5E5E5 !important;
          box-shadow: none !important;
        }
        .leaflet-bar a {
          border-radius: 0px !important;
          background-color: #FFFFFF !important;
          color: #222222 !important;
          border-bottom: 1px solid #E5E5E5 !important;
        }
        .leaflet-bar a:last-child {
          border-bottom: none !important;
        }
        .leaflet-control-zoom {
          border: 1px solid #E5E5E5 !important;
          margin: 24px 0 0 24px !important;
        }
        .leaflet-container {
          background-color: #EDEDED !important;
        }
        .custom-animated-cafe-marker {
          background: transparent !important;
          border: none !important;
        }
        @keyframes beanRoastAction {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-6px) rotate(-10deg) scale(1.05);
          }
          50% {
            transform: translateY(-2px) rotate(8deg) scale(1.02);
          }
          75% {
            transform: translateY(-7px) rotate(-6deg) scale(1.06);
          }
        }
        @keyframes cupBobAction {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes heatWaveRise {
          0% {
            opacity: 0;
            transform: translateY(4px) scaleY(0.7);
          }
          50% {
            opacity: 0.95;
            transform: translateY(-2px) scaleY(1.1);
          }
          100% {
            opacity: 0;
            transform: translateY(-8px) scaleY(0.8);
          }
        }
        .marker-roasting-bean {
          animation: beanRoastAction 1.8s ease-in-out infinite;
        }
        .marker-steaming-cup {
          animation: cupBobAction 2s ease-in-out infinite;
        }
        .roast-wave, .steam-wisp {
          display: block;
          width: 2.5px;
          height: 8px;
          background: #222222;
          border-radius: 2px;
          animation: heatWaveRise 1.4s ease-in-out infinite;
        }
        .roast-wave.w2, .steam-wisp.s2 {
          animation-delay: 0.45s;
          height: 10px;
        }
        .roast-wave.w3 {
          animation-delay: 0.9s;
        }
      `,
        }}
      />

      {/* Locate Me Button */}
      {onRequestUserLocation && (
        <button
          type="button"
          onClick={onRequestUserLocation}
          title="Center on my location"
          aria-label="Center on my location"
          className="absolute top-[94px] left-6 z-[1000] w-[30px] h-[30px] bg-canvas-white border border-border-subtle flex items-center justify-center hover:bg-surface-alt transition-colors text-primary"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      )}

      <MapContainer
        center={initialCenter}
        zoom={14}
        zoomControl={true}
        className="h-full w-full border-0 outline-none"
        style={{ height: '100%', width: '100%' }}
      >
        {/* Clean label-free, landmark-free, icon-free base map */}
        <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={15}
          maxZoom={18}
        />

        {cafes.map((cafe) => {
          const coords = getCafeCoordinates(cafe)
          const isSelected = selectedCafe?.id === cafe.id
          const isOpen = cafe.status === 'Open'
          const isRoastery = isCafeRoastery(cafe)
          const size = getMarkerSizeForZoom(zoom, isSelected)
          const icon = createAnimatedCafeIcon(isRoastery, isOpen, isSelected, size)

          return (
            <Marker
              key={cafe.id}
              position={coords}
              icon={icon}
              eventHandlers={{
                click: () => {
                  onSelectCafe(cafe)
                },
                mouseover: () => {
                  handleMarkerMouseOver(cafe)
                },
                mouseout: () => {
                  handleMarkerMouseOut()
                },
              }}
            />
          )
        })}

        <MapController
          selectedCafe={selectedCafe}
          mapCenter={mapCenter}
          onZoomChange={setZoom}
          onMapMove={updateHoverPosition}
        />
      </MapContainer>

      {/* Rich Hover Tooltip with Image Carousel, Name, Address, Opening Hours & 24/7 Badge */}
      {hoveredCafe && hoverPoint && (
        <div
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{
            left: `${hoverPoint.x}px`,
            top: `${Math.max(16, hoverPoint.y - 28)}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute z-[1200] w-72 bg-canvas-white border border-primary shadow-xl pointer-events-auto transition-all duration-150"
        >
          {/* Carousel of Images */}
          <div className="relative w-full h-36 bg-surface-container overflow-hidden border-b border-border-subtle">
            <img
              src={hoverImages[carouselIdx] || hoveredCafe.image}
              alt={hoveredCafe.name}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => {
                onSelectCafe(hoveredCafe)
                setHoveredCafe(null)
              }}
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

            {/* Carousel Controls */}
            {hoverImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCarouselIdx(
                      (prev) => (prev - 1 + hoverImages.length) % hoverImages.length
                    )
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-canvas-white/90 hover:bg-canvas-white border border-border-subtle flex items-center justify-center text-primary"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCarouselIdx((prev) => (prev + 1) % hoverImages.length)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-canvas-white/90 hover:bg-canvas-white border border-border-subtle flex items-center justify-center text-primary"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 right-2.5 flex gap-1">
                  {hoverImages.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1 transition-all ${
                        idx === carouselIdx ? 'w-3.5 bg-canvas-white' : 'w-1 bg-canvas-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Top Badges */}
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <span
                className={`px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                  hoveredCafe.status === 'Open'
                    ? 'bg-primary text-canvas-white'
                    : 'bg-error text-canvas-white'
                }`}
              >
                {hoveredCafe.status === 'Open' ? 'Open' : 'Closed'}
              </span>
              {isCafe24Hours(hoveredCafe) && (
                <span className="px-2 py-0.5 bg-canvas-white text-primary border border-primary font-mono text-[9px] font-bold uppercase">
                  24/7
                </span>
              )}
            </div>

            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-canvas-white/95 text-primary font-mono text-[9px] uppercase tracking-wider">
              {isCafeRoastery(hoveredCafe) ? 'Roastery' : 'Cafe'}
            </span>

            {/* Save Button on Hover Tooltip (Logged-In Users Only) */}
            {isLoggedIn && isBookmarked && onToggleBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleBookmark(hoveredCafe.id)
                }}
                title={
                  isBookmarked(hoveredCafe.id)
                    ? 'Remove from Directory'
                    : 'Save to Directory'
                }
                aria-label={
                  isBookmarked(hoveredCafe.id)
                    ? 'Remove from Directory'
                    : 'Save to Directory'
                }
                className="absolute top-2 right-2 w-7 h-7 bg-canvas-white/95 hover:bg-canvas-white border border-border-subtle flex items-center justify-center text-primary shadow-sm"
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isBookmarked(hoveredCafe.id) ? 'fill-primary text-primary' : 'text-primary'
                  }`}
                />
              </button>
            )}
          </div>

          {/* Most Important Details */}
          <div
            onClick={() => {
              onSelectCafe(hoveredCafe)
              setHoveredCafe(null)
            }}
            className="p-3 cursor-pointer hover:bg-surface-alt transition-colors"
          >
            <h4 className="font-hanken text-body-lg font-bold text-primary leading-snug">
              {hoveredCafe.name}
            </h4>
            <div className="flex items-center gap-1.5 text-secondary font-sans text-[12px] mt-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{hoveredCafe.location}</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-border-subtle">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-primary uppercase">
                <Clock className="w-3 h-3 text-secondary shrink-0" />
                <span>{hoveredCafe.hours || '8:00 AM - 9:00 PM'}</span>
              </div>
              <span className="font-mono text-[9px] uppercase text-secondary underline">
                Click for details
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
