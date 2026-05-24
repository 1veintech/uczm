"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Polygon as LeafletPolygon } from "leaflet";

interface RegionMapProps {
  center: [number, number];
  zoom?: number;
  bounds?: [number, number][];
  editable?: boolean;
  onChange?: (bounds: [number, number][]) => void;
  regionName?: string;
  height?: string;
}

export default function RegionMap({
  center,
  zoom = 12,
  bounds = [],
  editable = false,
  onChange,
  regionName,
  height = "400px",
}: RegionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const polygonRef = useRef<LeafletPolygon | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<[number, number][]>(bounds);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !mounted) return;

    const L = require("leaflet");

    // Fix default marker icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const map = L.map(mapRef.current, {
      // Prevent map from overlapping other page elements
      zoomControl: true,
      attributionControl: true,
    }).setView(center, zoom);

    // Ensure proper rendering
    setTimeout(() => map.invalidateSize(), 100);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    mapInstanceRef.current = map;

    // Draw existing bounds
    if (bounds.length > 0) {
      const polygon = L.polygon(bounds, {
        color: "#3B82F6",
        fillColor: "#3B82F6",
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(map);
      polygonRef.current = polygon;
      setTimeout(() => map.fitBounds(polygon.getBounds()), 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted]);

  // Fix z-index: lower Leaflet containers so they don't block page UI
  useEffect(() => {
    if (!mapRef.current || !mounted) return;
    const container = mapRef.current;
    // Lower z-index of all Leaflet panes
    const style = document.createElement("style");
    style.id = "leaflet-z-fix";
    style.textContent = `
      #${container.id} .leaflet-pane { z-index: 1 !important; }
      #${container.id} .leaflet-top, #${container.id} .leaflet-bottom { z-index: 2 !important; }
      #${container.id} .leaflet-control { z-index: 2 !important; }
    `;
    container.appendChild(style);
    return () => {
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, [mounted]);

  // Update points when bounds prop changes
  useEffect(() => {
    if (bounds.length > 0 && JSON.stringify(bounds) !== JSON.stringify(points)) {
      setPoints(bounds);
    }
  }, [bounds]);

  useEffect(() => {
    if (!mapInstanceRef.current || !editable) return;

    const L = require("leaflet");
    const map = mapInstanceRef.current;

    const handleClick = (e: any) => {
      if (!drawing) return;
      const newPoints: [number, number][] = [...points, [e.latlng.lat, e.latlng.lng]];
      setPoints(newPoints);

      if (polygonRef.current) {
        polygonRef.current.setLatLngs(newPoints);
      } else {
        polygonRef.current = L.polygon(newPoints, {
          color: "#3B82F6",
          fillColor: "#3B82F6",
          fillOpacity: 0.2,
          weight: 2,
        }).addTo(map);
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [drawing, points, editable]);

  const handleStartDraw = () => {
    if (polygonRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }
    setPoints([]);
    setDrawing(true);
    // Invalidate map size to fix rendering
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50);
  };

  const handleFinishDraw = () => {
    setDrawing(false);
    if (onChange && points.length >= 3) {
      onChange(points);
    }
  };

  const handleClear = () => {
    if (polygonRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }
    setPoints([]);
    onChange?.([]);
  };

  if (!mounted) {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center" style={{ height }}>
        <p className="text-gray-400 text-sm">地图加载中...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-xl overflow-hidden border border-gray-200 relative" style={{ zIndex: 0 }}>
      {/* Toolbar */}
      {editable && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-100 relative" style={{ zIndex: 10 }}>
          {!drawing ? (
            <>
              <button
                onClick={handleStartDraw}
                className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium active:scale-95 transition-transform"
              >
                开始绘制区域
              </button>
              {points.length > 0 && (
                <>
                  <span className="text-xs text-gray-400">
                    已绘制 {points.length} 个点
                  </span>
                  <button
                    onClick={handleClear}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium"
                  >
                    清除
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <span className="text-xs text-blue-500 font-medium animate-pulse">
                点击地图绘制区域边界（至少3个点）
              </span>
              <button
                onClick={handleFinishDraw}
                disabled={points.length < 3}
                className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium disabled:opacity-50 active:scale-95 transition-transform"
              >
                完成绘制（{points.length}个点）
              </button>
            </>
          )}
          {regionName && (
            <span className="ml-auto text-xs text-gray-400">{regionName}</span>
          )}
        </div>
      )}

      {/* Map container */}
      <div ref={mapRef} style={{ height, width: "100%", zIndex: 1, position: "relative" }} />

      {/* Info bar */}
      {points.length > 0 && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 relative" style={{ zIndex: 10 }}>
          <p className="text-[10px] text-gray-400">
            区域边界坐标: {points.length} 个顶点
            {points.length >= 3 && " · 已形成闭合区域"}
          </p>
        </div>
      )}
    </div>
  );
}
