import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/DashboardShell';
import Navbar from '../components/Navbar';
import StampBadge from '../components/StampBadge';
import api from '../lib/api';
import 'leaflet/dist/leaflet.css';
import { statusDivIcon } from '../lib/leafletIcons';

const ISSUE_LABELS = {
  pothole: 'Pothole', garbage: 'Garbage', street_light: 'Street Light', water_leak: 'Water Leak', other: 'Other',
};

function MapBody() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get('/api/v1/complaints').then(({ data }) => setReports(data.data || []));
  }, []);

  return (
    <div className="h-[calc(100vh-140px)] overflow-hidden rounded-xl border border-ink/15 md:h-[calc(100vh-64px)]">
      <MapContainer center={{ lat: 21.1458, lng: 79.0882 }} zoom={12} style={{ height: '100%' }}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {reports.map((r) => {
          const [lng, lat] = r.location?.coordinates || [];
          if (!lat || !lng) return null;
          return (
            <Marker key={r._id} position={{ lat, lng }} icon={statusDivIcon(r.status)}>
              <Popup>
                <div className="w-48">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-ink/45">{r.ticketId}</span>
                    <StampBadge status={r.status} size="sm" />
                  </div>
                  <p className="font-display font-bold text-ink">{ISSUE_LABELS[r.issueType] || r.issueType}</p>
                  <p className="line-clamp-2 text-xs text-ink/60">{r.description}</p>
                  <button
                    onClick={() => navigate(`/reports/${r._id}`)}
                    className="mt-2 text-xs font-semibold text-teal hover:underline"
                  >
                    View docket &rarr;
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default function MapView() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <DashboardShell>
        <p className="font-mono text-xs text-ink/45">CITY OVERVIEW</p>
        <h1 className="mb-4 font-display text-2xl font-bold text-ink">Live report map</h1>
        <MapBody />
      </DashboardShell>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="font-mono text-xs text-ink/45">CITY OVERVIEW</p>
        <h1 className="mb-4 font-display text-2xl font-bold text-ink">Live report map</h1>
        <MapBody />
      </div>
    </div>
  );
}
