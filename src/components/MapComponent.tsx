'use client'

import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { Cafe, getCafeCoordinates } from '@/lib/data'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'

interface MapComponentProps {
  cafes: Cafe[]
  selectedCafe: Cafe | null
  onSelectCafe: (cafe: Cafe) => void
}

// Recenter component to handle view panning on selection changes
function MapRecenter({ selectedCafe }: { selectedCafe: Cafe | null }) {
  const map = useMap()
  useEffect(() => {
    if (selectedCafe) {
      const coords = getCafeCoordinates(selectedCafe)
      map.setView(coords, 14, { animate: true })
    }
  }, [selectedCafe, map])
  return null
}

// Custom Leaflet coffee bean icon generator using L.divIcon and inline SVG
const createCoffeeBeanIcon = (isSelected: boolean, isOpen: boolean) => {
  const markerColor = isSelected ? '#222222' : isOpen ? '#444444' : '#888888'
  const strokeColor = '#FFFFFF'
  const size = isSelected ? 36 : 28

  return L.divIcon({
    className: 'custom-bean-icon-wrapper',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${markerColor};
        border: 2px solid ${strokeColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: all 0.2s ease-in-out;
      ">
        <svg viewBox="0 0 512 512" width="${size - 12}px" height="${size - 12}px" fill="none" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">
          <!-- Coffee bean outline -->
          <path d="M410.2,168.4 C364.5,80.3 281.3,32 190.2,32 C125.7,32 64,74.7 64,136.2 C64,204.5 106.6,273.4 175.7,321.4 C227.8,357.6 288.7,372 346,365.3 C404,358.5 448,318 460,260.6 C470.2,211 447.2,148.6 410.2,168.4 Z" fill="#FFFFFF"/>
          <!-- Tilted crease line -->
          <path d="M160,270 C185,295 220,300 250,285 C280,270 300,240 300,210 C300,180 280,150 250,135" stroke="${markerColor}" stroke-width="32" fill="none"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function MapComponent({ cafes, selectedCafe, onSelectCafe }: MapComponentProps) {
  // Determine initial center
  const initialCenter: [number, number] = selectedCafe ? getCafeCoordinates(selectedCafe) : [51.526233, -0.086311]

  return (
    <div className="w-full h-full relative grayscale contrast-[1.05] brightness-[0.98]">
      {/* Dynamic CSS overrides for Leaflet elements (forcing strict ROOT 0px border style) */}
      <style dangerouslySetInnerHTML={{
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
        .leaflet-popup-content-wrapper {
          border-radius: 0px !important;
          border: 1px solid #E5E5E5 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        .leaflet-popup-tip {
          border: 1px solid #E5E5E5 !important;
          background: #FFFFFF !important;
        }
        .leaflet-container {
          background-color: #FDF8F8 !important;
        }
      `}} />

      <MapContainer
        center={initialCenter}
        zoom={14}
        zoomControl={true}
        className="h-full w-full border-0 outline-none"
        style={{ height: '100%', width: '100%' }}
      >
        {/* Minimalist grayscale CartoDB Positron base tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {cafes.map((cafe) => {
          const coords = getCafeCoordinates(cafe)
          const isSelected = selectedCafe?.id === cafe.id
          const isOpen = cafe.status === 'Open'
          const icon = createCoffeeBeanIcon(isSelected, isOpen)

          return (
            <Marker
              key={cafe.id}
              position={coords}
              icon={icon}
              eventHandlers={{
                click: () => {
                  onSelectCafe(cafe)
                },
              }}
            />
          )
        })}

        {/* Dynamic Recenter Control */}
        <MapRecenter selectedCafe={selectedCafe} />
      </MapContainer>
    </div>
  )
}
