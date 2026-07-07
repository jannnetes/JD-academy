import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import { api } from "../api";

export default function Certificate() {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const paperRef = useRef(null);

  useEffect(() => {
    api(`/enrollment/certificates/${certificateId}`)
      .then(setCert)
      .catch((err) => setError(err.message));
  }, [certificateId]);

  async function downloadPdf() {
    if (!paperRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(paperRef.current, { scale: 3, backgroundColor: "#F7F4EE" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`JD-Academy-Certificate-${cert.serial}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  if (error) {
    return (
      <main className="site">
        <Header />
        <div className="table-empty"><p>{error}</p></div>
      </main>
    );
  }
  if (!cert) {
    return (
      <main className="site">
        <Header />
        <div className="table-empty"><p>Loading certificate...</p></div>
      </main>
    );
  }

  const issued = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <main className="site cert-page">
      <Header />

      <div className="cert-toolbar">
        <Link to="/dashboard" className="link small">← Back to dashboard</Link>
        <button className="primary-btn" onClick={downloadPdf} disabled={downloading}>
          {downloading ? "Preparing PDF…" : "Download PDF"}
        </button>
      </div>

      <div className="cert-frame">
        <div className="cert-paper" ref={paperRef}>
          <div className="cert-border">
            <span className="cert-eyebrow">Certificate of Completion</span>
            <div className="cert-seal-big">🎓</div>
            <p className="cert-line">This certifies that</p>
            <h1 className="cert-name">{cert.user.name}</h1>
            <p className="cert-line">has successfully completed the course</p>
            <h2 className="cert-course">{cert.course.title}</h2>
            <p className="cert-line muted">Instructed by {cert.course.teacher.name}</p>

            <div className="cert-footer">
              <div className="cert-footer-col">
                <span className="cert-footer-label">Date issued</span>
                <span className="cert-footer-value">{issued}</span>
              </div>
              <div className="cert-brand">JD Academy</div>
              <div className="cert-footer-col right">
                <span className="cert-footer-label">Serial number</span>
                <span className="cert-footer-value">{cert.serial}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
