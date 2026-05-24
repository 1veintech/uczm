"use client";

import dynamic from "next/dynamic";

const RegionMap = dynamic(() => import("@/components/region-map/region-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] rounded-xl bg-zinc-800 flex items-center justify-center">
      <p className="text-zinc-500 text-sm">地图加载中...</p>
    </div>
  ),
});

interface AgentMapProps {
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
  regionBounds: [number, number][];
  regionName: string;
}

export default function AgentMap({
  centerLat,
  centerLng,
  zoomLevel,
  regionBounds,
  regionName,
}: AgentMapProps) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ width: "100%" }}>
      <RegionMap
        center={[centerLat, centerLng]}
        zoom={zoomLevel}
        bounds={regionBounds}
        regionName={regionName}
        height="300px"
      />
    </div>
  );
}
