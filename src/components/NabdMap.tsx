import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  DistrictSector,
  PublicReportPin,
  Report,
  ReportType,
  User,
  UserRole,
} from '../types/nabd';
import { DAMMAM_SECTORS } from '../services/nabdStore';
import { MapPin, Layers, Flame, Navigation, AlertTriangle } from 'lucide-react';

interface NabdMapProps {
  currentUser: User | null;
  role: UserRole;
  reports?: Report[]; // For Employee
  myReports?: Report[]; // For Citizen
  publicPins?: PublicReportPin[]; // For Citizen
  selectedReportId?: string | null;
  onSelectReport?: (reportId: string) => void;
  // Citizen reporting mode props
  isPickingLocation?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
  // Decision maker props
  heatmapPoints?: [number, number, number][];
  highlightSectorId?: string | null;
}

export const NabdMap: React.FC<NabdMapProps> = ({
  currentUser,
  role,
  reports = [],
  myReports = [],
  publicPins = [],
  selectedReportId,
  onSelectReport,
  isPickingLocation = false,
  pickedLocation,
  onPickLocation,
  heatmapPoints = [],
  highlightSectorId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const sectorsLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const pickCircleRef = useRef<L.Circle | null>(null);
  const pickMarkerRef = useRef<L.Marker | null>(null);

  const [showHeatmap, setShowHeatmap] = useState<boolean>(role === 'decision_maker');
  const [showSectors, setShowSectors] = useState<boolean>(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    // Dammam Center: [26.4207, 50.0888], zoom 13
    const map = L.map(mapContainerRef.current, {
      center: [26.4300, 50.0900],
      zoom: 13,
      zoomControl: false,
    });

    // Zoom control on top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | منصة نبض',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    sectorsLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    // Handle map click for location picking
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onPickLocation) {
        onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update showHeatmap if role changes to/from decision_maker
  useEffect(() => {
    if (role === 'decision_maker') {
      setShowHeatmap(true);
    }
  }, [role]);

  // Render Dammam Sectors Layer
  useEffect(() => {
    if (!mapRef.current || !sectorsLayerRef.current) return;
    sectorsLayerRef.current.clearLayers();

    if (!showSectors) return;

    DAMMAM_SECTORS.forEach((sec) => {
      const isHighlighted = highlightSectorId === sec.id;

      const polygon = L.polygon(sec.bounds, {
        color: isHighlighted ? '#D4AF37' : '#0B3A5B',
        weight: isHighlighted ? 3 : 1.5,
        dashArray: isHighlighted ? undefined : '4, 4',
        fillColor: isHighlighted ? '#D4AF37' : '#0B3A5B',
        fillOpacity: isHighlighted ? 0.25 : 0.06,
      });

      polygon.bindTooltip(
        `<div style="font-family: Cairo, sans-serif; font-size: 11px; font-weight: bold; text-align: right;">${sec.name}</div>`,
        {
          permanent: false,
          direction: 'center',
          className: 'sector-tooltip',
        }
      );

      sectorsLayerRef.current?.addLayer(polygon);
    });
  }, [showSectors, highlightSectorId]);

  // Render Picked Location & 70m Proximity Circle for Citizen
  useEffect(() => {
    if (!mapRef.current) return;

    if (pickMarkerRef.current) {
      mapRef.current.removeLayer(pickMarkerRef.current);
      pickMarkerRef.current = null;
    }
    if (pickCircleRef.current) {
      mapRef.current.removeLayer(pickCircleRef.current);
      pickCircleRef.current = null;
    }

    if (pickedLocation) {
      // 70m circle
      const circle = L.circle([pickedLocation.lat, pickedLocation.lng], {
        radius: 70, // 70 meters standard proximity
        color: '#B3261E',
        fillColor: '#B3261E',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '3, 3',
      }).addTo(mapRef.current);

      circle.bindTooltip('نطاق التحقق من التكرار (70 متراً)', {
        direction: 'top',
        className: 'radius-tooltip',
      });

      pickCircleRef.current = circle;

      // Custom marker for picked spot
      const icon = L.divIcon({
        className: 'custom-pick-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; background: rgba(11, 58, 91, 0.3); border-radius: 50%;" class="marker-pulse"></div>
            <div style="width: 22px; height: 22px; background: #0B3A5B; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 7px; height: 7px; background: #D4AF37; border-radius: 50%;"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([pickedLocation.lat, pickedLocation.lng], {
        icon,
      }).addTo(mapRef.current);

      pickMarkerRef.current = marker;
    }
  }, [pickedLocation]);

  // Render Heatmap Layer (Decision Maker Mode)
  useEffect(() => {
    if (!mapRef.current || !heatmapLayerRef.current) return;
    heatmapLayerRef.current.clearLayers();

    if (!showHeatmap) return;

    // Render Canvas-based radial heat density circles
    heatmapPoints.forEach(([lat, lng, weight]) => {
      // Outer glow
      const outerCircle = L.circle([lat, lng], {
        radius: 260,
        stroke: false,
        fillColor: '#FF5722',
        fillOpacity: 0.12 * weight,
      });

      // Medium heat
      const midCircle = L.circle([lat, lng], {
        radius: 140,
        stroke: false,
        fillColor: '#E65100',
        fillOpacity: 0.22 * weight,
      });

      // Core hot center
      const coreCircle = L.circle([lat, lng], {
        radius: 65,
        stroke: false,
        fillColor: '#B3261E',
        fillOpacity: 0.35 * weight,
      });

      heatmapLayerRef.current?.addLayer(outerCircle);
      heatmapLayerRef.current?.addLayer(midCircle);
      heatmapLayerRef.current?.addLayer(coreCircle);
    });
  }, [showHeatmap, heatmapPoints]);

  // Helper function to build custom marker HTML
  const createMarkerHtml = (
    type: ReportType,
    status: string,
    recurrenceCount: number = 1,
    isMine: boolean = false
  ) => {
    let color = '#B3261E'; // Red default for pothole
    let iconChar = '⚠️';

    if (type === 'lighting') {
      color = '#D4AF37'; // Gold
      iconChar = '💡';
    } else if (type === 'leak') {
      color = '#0284C7'; // Blue
      iconChar = '💧';
    }

    if (status === 'closed') {
      color = '#2E7D32'; // Green
    } else if (status === 'assigned') {
      color = '#16537E';
    }

    const hasHighRecurrence = recurrenceCount >= 3;
    const pulseClass = status === 'new' || hasHighRecurrence ? 'marker-pulse' : '';

    return `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${
          pulseClass
            ? `<div style="position: absolute; width: 34px; height: 34px; background: ${color}40; border-radius: 50%;" class="${pulseClass}"></div>`
            : ''
        }
        <div style="position: relative; width: 26px; height: 26px; background: ${color}; border: 2px solid ${
      isMine ? '#D4AF37' : 'white'
    }; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">
          <span>${iconChar}</span>
          ${
            recurrenceCount > 1
              ? `<div style="position: absolute; top: -6px; left: -6px; background: #0B3A5B; color: #D4AF37; border: 1.5px solid white; border-radius: 9999px; font-size: 9px; font-weight: bold; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">${recurrenceCount}</div>`
              : ''
          }
        </div>
      </div>
    `;
  };

  // Render Incident Markers based on Active Role
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    // 1. Employee Role: Sees ALL reports with technical inspection details
    if (role === 'employee') {
      reports.forEach((rep) => {
        const isSelected = selectedReportId === rep.id;
        const icon = L.divIcon({
          className: 'custom-report-marker',
          html: createMarkerHtml(rep.type, rep.status, rep.recurrenceCount || 1, false),
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([rep.lat, rep.lng], { icon });

        // Popup with technical information & inspection trigger
        const popupContent = `
          <div style="direction: rtl; font-family: Cairo, sans-serif; min-width: 200px;">
            <div style="font-size: 10px; color: #64748B; margin-bottom: 2px;">${rep.caseNo} · ${rep.sectorName}</div>
            <div style="font-size: 13px; font-weight: bold; color: #0F172A; margin-bottom: 6px;">
              ${rep.type === 'pothole' ? 'حفرة أسفلتية' : rep.type === 'lighting' ? 'عطل إنارة' : 'تسريب مياه'}
            </div>
            <div style="font-size: 11px; color: #334155; margin-bottom: 8px;">
              ${rep.description.length > 70 ? rep.description.substring(0, 70) + '...' : rep.description}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; border-top: 1px solid #E2E8F0; padding-top: 6px;">
              <span style="font-weight: bold; color: ${rep.status === 'confirmed' ? '#2E7D32' : rep.status === 'new' ? '#B3261E' : '#0B3A5B'};">
                الحالة: ${
                  rep.status === 'new'
                    ? 'جديد'
                    : rep.status === 'confirmed'
                    ? 'مؤكد'
                    : rep.status === 'assigned'
                    ? 'محال للمقاول'
                    : rep.status === 'done'
                    ? 'منجز'
                    : 'مغلق'
                }
              </span>
              <span>التكرار: <strong>${rep.recurrenceCount || 1}</strong></span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectReport) onSelectReport(rep.id);
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 2. Citizen Role: Sees OWN reports with full status, and OTHER reports strictly anonymized
    else if (role === 'citizen') {
      // Citizen's OWN reports
      myReports.forEach((rep) => {
        const icon = L.divIcon({
          className: 'custom-report-marker my-report',
          html: createMarkerHtml(rep.type, rep.status, rep.recurrenceCount || 1, true),
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([rep.lat, rep.lng], { icon });
        const popupContent = `
          <div style="direction: rtl; font-family: Cairo, sans-serif; min-width: 190px;">
            <div style="font-size: 10px; color: #2E7D32; font-weight: bold; margin-bottom: 2px;">★ بلاغك الشخصي</div>
            <div style="font-size: 12px; font-weight: bold; color: #0F172A;">${rep.caseNo}</div>
            <div style="font-size: 11px; color: #475569; margin: 4px 0;">${rep.description}</div>
            <div style="font-size: 10px; color: #0B3A5B; font-weight: bold; margin-top: 4px;">
              الحالة: ${
                rep.status === 'new'
                  ? 'تم الاستلام (جديد)'
                  : rep.status === 'confirmed'
                  ? 'تم التحقق والاعتماد'
                  : rep.status === 'assigned'
                  ? 'محال للمقاول'
                  : rep.status === 'done'
                  ? 'تم إنجاز الأعمال'
                  : 'مغلق بنجاح'
              }
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectReport) onSelectReport(rep.id);
        });
        markersLayerRef.current?.addLayer(marker);
      });

      // OTHER citizens' reports: RESTRICTED! Only type, status, and recurrence count
      publicPins.forEach((pin) => {
        const icon = L.divIcon({
          className: 'custom-report-marker public-pin',
          html: createMarkerHtml(pin.type, pin.status, pin.recurrenceCount, false),
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([pin.lat, pin.lng], { icon });
        const popupContent = `
          <div style="direction: rtl; font-family: Cairo, sans-serif; min-width: 170px;">
            <div style="font-size: 10px; color: #64748B;">بلاغ عام مسجل · ${pin.sectorName}</div>
            <div style="font-size: 12px; font-weight: bold; color: #0F172A; margin: 2px 0;">
              ${pin.type === 'pothole' ? 'حفرة أسفلتية' : pin.type === 'lighting' ? 'عطل إنارة' : 'تسريب مياه'}
            </div>
            <div style="font-size: 10px; color: #475569; margin-top: 4px;">
              الحالة: <strong>${
                pin.status === 'new'
                  ? 'جديد'
                  : pin.status === 'confirmed'
                  ? 'مؤكد'
                  : pin.status === 'assigned'
                  ? 'محال للمقاول'
                  : pin.status === 'done'
                  ? 'منجز'
                  : 'مغلق'
              }</strong>
            </div>
            <div style="font-size: 10px; color: #0B3A5B; margin-top: 2px;">
              عدد مرات التكرار: <strong>${pin.recurrenceCount}</strong>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 3. Decision Maker Role:
    // STRICT DATA ISOLATION! NO INDIVIDUAL REPORT MARKERS ARE SHOWN!
    // Shows only sector boundaries and heatmap density.
  }, [role, reports, myReports, publicPins, selectedReportId]);

  // Quick navigation helpers
  const handleFlyToCluster = () => {
    if (!mapRef.current) return;
    // Central Dammam Pothole cluster
    mapRef.current.flyTo([26.4343, 50.1030], 16, { duration: 1.2 });
  };

  const handleFlyToDammam = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([26.4300, 50.0900], 13, { duration: 1.2 });
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px]" />

      {/* Floating Action Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={handleFlyToCluster}
          className="bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold py-2 px-3 rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
          title="الانتقال إلى بؤرة الحفر المتكررة بوسط الدمام"
        >
          <Navigation className="w-3.5 h-3.5 text-[#B3261E]" />
          <span>بؤرة وسط الدمام (التكرار)</span>
        </button>

        <button
          onClick={handleFlyToDammam}
          className="bg-white/95 hover:bg-white text-slate-800 text-xs font-medium py-1.5 px-3 rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
          title="عرض كامل حاضرة الدمام"
        >
          <MapPin className="w-3.5 h-3.5 text-[#0B3A5B]" />
          <span>كامل الدمام</span>
        </button>
      </div>

      {/* Bottom Floating Legend & Layer Toggles */}
      <div className="absolute bottom-3 right-3 left-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Toggles */}
        <div className="bg-white/95 backdrop-blur-xs rounded-xl p-1.5 shadow-md border border-slate-200 flex items-center gap-1 pointer-events-auto text-xs">
          <button
            onClick={() => setShowSectors(!showSectors)}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              showSectors ? 'bg-[#0B3A5B] text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>حدود القطاعات</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              showHeatmap
                ? 'bg-[#B3261E] text-white font-medium'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>خريطة الكثافة الحرارية</span>
          </button>
        </div>

        {/* Legend */}
        <div className="bg-white/95 backdrop-blur-xs rounded-xl px-3 py-1.5 shadow-md border border-slate-200 hidden md:flex items-center gap-3 text-[11px] text-slate-600 pointer-events-auto">
          <span className="font-semibold text-slate-800">الدلالات:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B3261E]" />
            <span>حفرة أسفلتية</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
            <span>إنارة</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
            <span>تسريب مياه</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
            <span>مغلق / منجز</span>
          </div>
          {role === 'citizen' && (
            <div className="flex items-center gap-1 text-[#B3261E] font-medium border-r border-slate-200 pr-2">
              <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#B3261E]" />
              <span>دائرة 70م (التكرار)</span>
            </div>
          )}
        </div>
      </div>

      {/* Picking Location Guide Overlay (when in Citizen Reporting mode) */}
      {isPickingLocation && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#0B3A5B] text-white text-xs py-1.5 px-4 rounded-full shadow-lg border border-white/20 flex items-center gap-2 pointer-events-none animate-pulse">
          <MapPin className="w-4 h-4 text-[#D4AF37]" />
          <span>انقر في أي مكان على الخريطة لتحديد موقع الضرر بدقة</span>
        </div>
      )}
    </div>
  );
};
