import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Camera, Sparkles, MapPin, Loader2, Send, X, CheckCircle2, AlertTriangle } from 'lucide-react';
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

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB, matches backend multer limit
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const DEFAULT_CENTER = { lat: 21.1458, lng: 79.0882 };

function LocationPicker({ position, onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function bytesToReadable(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
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
  const [imageError, setImageError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [locating, setLocating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Location services are not available in this browser. Please drop a pin manually.');
      return;
    }
    setLocating(true);
    setError('');
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
      (geoErr) => {
        setLocating(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setError('Location access was denied. Please drop a pin on the map instead.');
        } else {
          setError('Could not detect your location. Please drop a pin on the map instead.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onPick = useCallback(async (latlng) => {
    setPosition(latlng);
    setFieldErrors((prev) => ({ ...prev, position: undefined }));
    try {
      const { data } = await api.get('/api/v1/reverse-geocode', { params: { lat: latlng.lat, lon: latlng.lng } });
      setAddress(data.data?.display_name || '');
    } catch {
      /* ignore */
    }
  }, []);

  const applyFile = (file) => {
    setImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file (JPG, PNG, or WEBP).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(`That image is ${bytesToReadable(file.size)}. Please choose one under 5MB.`);
      return;
    }
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const onFileChange = (e) => {
    applyFile(e.target.files?.[0]);
    // allow re-selecting the same file later
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    applyFile(e.dataTransfer.files?.[0]);
  };

  const removeImage = (e) => {
    e.stopPropagation();
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview('');
    setImageError('');
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
      } else {
        setError('AI analysis returned no description — please describe it manually.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis is unavailable right now — describe it manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!description.trim()) errs.description = 'Please describe the issue.';
    if (!position) errs.position = 'Drop a pin on the map or use your current location.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) {
      setError('Please fill in the highlighted fields before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('issueType', issueType);
      fd.append('description', description.trim());
      fd.append('latitude', position.lat);
      fd.append('longitude', position.lng);
      fd.append('address', address);
      if (imageFile) fd.append('image', imageFile);

      await api.post('/api/v1/complaints', fd);
      setSuccess(true);
      setTimeout(() => navigate('/my-reports'), 1200);
    } catch (err) {
      if (!err.response) {
        setError('Could not reach the server. Check your connection and try again.');
      } else if (err.response.status === 401) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(err.response?.data?.message || 'Could not file this report. Please try again.');
      }
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

      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-6 lg:grid-cols-2">
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
                  aria-pressed={issueType === t.value}
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
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/60">
              Photo <span className="font-normal normal-case text-ink/40">(optional, up to 5MB)</span>
            </span>
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={`relative flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-ink/45 transition hover:border-teal hover:text-teal ${
                  dragActive ? 'border-teal bg-teal/5 text-teal' : 'border-ink/25'
                }`}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Selected issue preview" className="h-full w-full rounded-lg object-cover" />
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Remove photo"
                      onClick={removeImage}
                      onKeyDown={(e) => e.key === 'Enter' && removeImage(e)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-ink/15 bg-card text-ink shadow-sm hover:bg-status-rejected hover:text-white"
                    >
                      <X size={13} />
                    </span>
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    <span className="text-[11px] font-semibold">Add photo</span>
                  </>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={onFileChange}
              />
              <div className="flex flex-col gap-2">
                {imageFile && (
                  <>
                    <p className="text-xs text-ink/50">
                      {imageFile.name} · {bytesToReadable(imageFile.size)}
                    </p>
                    <Button type="button" variant="outline" onClick={analyzeWithAI} disabled={analyzing}>
                      {analyzing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                      {analyzing ? 'Analyzing…' : 'Describe with AI'}
                    </Button>
                  </>
                )}
                {imageError && (
                  <p className="flex items-center gap-1 text-xs font-medium text-status-rejected">
                    <AlertTriangle size={13} /> {imageError}
                  </p>
                )}
                {!imageFile && !imageError && (
                  <p className="text-xs text-ink/40">Drag a photo here, or tap to browse.</p>
                )}
              </div>
            </div>
          </div>

          <Input
            label="Description"
            textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (e.target.value.trim()) setFieldErrors((prev) => ({ ...prev, description: undefined }));
            }}
            placeholder="What's wrong, and how bad is it?"
            required
            error={fieldErrors.description}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/60">Location</span>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline disabled:opacity-60"
            >
              {locating ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
              {locating ? 'Locating…' : 'Use my location'}
            </button>
          </div>
          <div
            className={`h-64 overflow-hidden rounded-lg border ${
              fieldErrors.position ? 'border-status-rejected' : 'border-ink/15'
            }`}
          >
            <MapContainer center={position || DEFAULT_CENTER} zoom={14} style={{ height: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker position={position} onPick={onPick} />
            </MapContainer>
          </div>
          {fieldErrors.position && (
            <p className="flex items-center gap-1 text-xs font-medium text-status-rejected">
              <AlertTriangle size={13} /> {fieldErrors.position}
            </p>
          )}
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Tap the map, or type it in"
          />

          {error && (
            <p className="flex items-center gap-1.5 rounded-md bg-status-rejected/10 px-3 py-2 text-sm font-medium text-status-rejected">
              <AlertTriangle size={15} className="shrink-0" /> {error}
            </p>
          )}
          {success && (
            <p className="flex items-center gap-1.5 rounded-md bg-status-resolved/10 px-3 py-2 text-sm font-medium text-status-resolved">
              <CheckCircle2 size={15} className="shrink-0" /> Filed! Redirecting to My Reports…
            </p>
          )}

          <Button type="submit" variant="amber" className="w-full" disabled={submitting || success}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? 'Filing report…' : 'Submit report'}
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}