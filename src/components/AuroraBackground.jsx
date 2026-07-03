// Soft animated warm aurora blobs behind all content (fixed, non-interactive).
export default function AuroraBackground() {
  return (
    <div className="aurora" aria-hidden="true">
      <span className="aurora-blob a1" />
      <span className="aurora-blob a2" />
      <span className="aurora-blob a3" />
      <div className="aurora-grain" />
    </div>
  );
}
