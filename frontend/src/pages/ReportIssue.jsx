import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Camera, Sparkles, MapPin, Loader2, Send } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../lib/api';
import 'leaflet/dist/leaflet.css';
import '../lib/leafletIcons';

const ISSUE_TYPES = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'garbage', label: 'Garbage' },
  { value: 'street_light', label: 'Street Light' },
  { value: 'water_leak', label: 'Water Leak' },
  { value: 'other', label: 'Other' },
];

function LocationPicker({ position, onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [issueType, setIssueType] = useState('pothole');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState(null); // { lat, lng }
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [locating, setLocating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const useMyLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(latlng);
        try {
          const { data } = await api.get('/api/v1/reverse-geocode', { params: { lat: latlng.lat, lon: latlng.lng } });
          setAddress(data.data?.display_name || '');
        } catch {
          /* address lookup is best-effort */
        }
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const onPick = useCallback(async (latlng) => {
    setPosition(latlng);
    try {
      const { data } = await api.get('/api/v1/reverse-geocode', { params: { lat: latlng.lat, lon: latlng.lng } });
      setAddress(data.data?.display_name || '');
    } catch {
      /* ignore */
    }
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const analyzeWithAI = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    setError('');
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
      const { data } = await api.post('/api/reports/analyze-image', {
        image: base64,
        mimeType: imageFile.type,
        location: address,
      });
      if (data.analysis) {
        const descMatch = data.analysis.match(/DESCRIPTION:\s*(.+)/i);
        setDescription(descMatch ? descMatch[1].trim() : data.analysis);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis is unavailable right now — describe it manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!position) {
      setError('Please drop a pin on the map or use your current location.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('issueType', issueType);
      fd.append('description', description);
      fd.append('latitude', position.lat);
      fd.append('longitude', position.lng);
      fd.append('address', address);
      if (imageFile) fd.append('image', imageFile);

      await api.post('/api/v1/complaints', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setTimeout(() => navigate('/my-reports'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not file this report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <p className="font-mono text-xs text-ink/45">NEW FILING</p>
      <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">File a report</h1>
      <p className="mt-1 max-w-xl text-sm text-ink/60">
        Add a photo, drop a pin where it's happening, and describe what you see. You'll get a
        docket number the moment you submit.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/60">
              Issue type
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ISSUE_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setIssueType(t.value)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    issueType === t.value
                      ? 'border-ink bg-ink text-paper'
                      : 'border-ink/15 bg-card text-ink/70 hover:border-ink/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/60">Photo</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-ink/25 text-ink/45 hover:border-teal hover:text-teal"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <>
                    <Camera size={20} />
                    <span className="text-[11px] font-semibold">Add photo</span>
                  </>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFileChange} />
              {imageFile && (
                <Button type="button" variant="outline" onClick={analyzeWithAI} disabled={analyzing}>
                  {analyzing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {analyzing ? 'Analyzing…' : 'Describe with AI'}
                </Button>
              )}
            </div>
          </div>

          <Input
            label="Description"
            textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's wrong, and how bad is it?"
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/60">Location</span>
            <button
              type="button"
              onClick={useMyLocation}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline"
            >
              <MapPin size={13} /> {locating ? 'Locating…' : 'Use my location'}
            </button>
          </div>
          <div className="h-64 overflow-hidden rounded-lg border border-ink/15">
            <MapContainer center={position || { lat: 21.1458, lng: 79.0882 }} zoom={14} style={{ height: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker position={position} onPick={onPick} />
            </MapContainer>
          </div>
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Tap the map, or type it in"
          />

          {error && <p className="text-sm font-medium text-status-rejected">{error}</p>}
          {success && <p className="text-sm font-medium text-status-resolved">Filed! Redirecting to My Reports…</p>}

          <Button type="submit" variant="amber" className="w-full" disabled={submitting}>
            <Send size={16} /> {submitting ? 'Filing report…' : 'Submit report'}
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
