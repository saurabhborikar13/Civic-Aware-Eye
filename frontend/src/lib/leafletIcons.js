import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Vite/webpack strip the default icon URLs baked into Leaflet's CSS-relative paths.
// Re-point them at the bundled assets so pins actually render.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const STATUS_COLORS = {
  pending: '#e6a13a',
  in_progress: '#3b6ea8',
  resolved: '#2f8f5b',
  rejected: '#c1473a',
};

export function statusDivIcon(status) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #f8f7f1;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default L;
