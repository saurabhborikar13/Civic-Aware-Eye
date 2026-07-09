import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="font-mono text-sm text-ink/40">CASE NOT FOUND</p>
      <h1 className="font-display text-4xl font-bold text-ink">404</h1>
      <p className="mt-2 max-w-sm text-ink/60">This docket doesn't exist, or the page moved.</p>
      <Button to="/" variant="primary" className="mt-6">Back to home</Button>
    </div>
  );
}
