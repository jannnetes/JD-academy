import Header from "../components/Header.jsx";

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#0D0D0D", marginBottom: 10 }}>{title}</h2>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, lineHeight: 1.7, color: "rgba(13,13,13,0.75)" }}>
        {children}
      </div>
    </section>
  );
}

function LegalPage({ crumb, title, updated, children }) {
  return (
    <div className="bold bs-page" style={{ background: "#F7F4EE", minHeight: "100vh" }}>
      <Header />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "160px 24px 100px" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#F73B20", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          JD ACADEMY / {crumb}
        </span>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px,7vw,80px)", color: "#0D0D0D", margin: "10px 0 6px", lineHeight: 0.95 }}>
          {title}
        </h1>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "rgba(13,13,13,0.5)", marginBottom: 48 }}>
          Last updated: {updated}
        </p>
        {children}
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalPage crumb="PRIVACY POLICY" title="PRIVACY POLICY" updated="July 2026">
      <Section title="1. What we collect">
        <p>When you register, we collect your name, email address, and password (stored as a secure hash — we never see or store your actual password). If you're a teacher, we may also collect a short bio and areas of expertise. If payments are enabled, payment details are handled entirely by our payment processor (Stripe) — we never see or store your card number.</p>
      </Section>
      <Section title="2. How we use it">
        <p>We use your data to run your account (login, course access, progress tracking, certificates), to send you transactional emails (registration confirmation, password resets, course/live-session updates), and to improve the platform. We do not sell your personal data to third parties.</p>
      </Section>
      <Section title="3. Third-party services">
        <p>We use SendGrid to deliver emails, and Railway/Netlify to host our servers and website. When enabled, Stripe processes payments. Each of these providers processes data only as needed to perform their service for us, under their own privacy policies.</p>
      </Section>
      <Section title="4. Cookies & local storage">
        <p>We use your browser's local storage to keep you signed in (an authentication token) and to remember your language and theme preference. We don't use third-party advertising trackers at this time.</p>
      </Section>
      <Section title="5. Your rights">
        <p>You can ask us to correct or delete your account and associated data at any time by contacting us (see below). Deleting your account will remove your personal information, though anonymized records needed for legal/accounting purposes (e.g. completed transactions) may be retained as required by law.</p>
      </Section>
      <Section title="6. Contact">
        <p>Questions about this policy? Reach us via the contact options on our Help &amp; Support page, or email us directly.</p>
      </Section>
    </LegalPage>
  );
}

export function TermsOfService() {
  return (
    <LegalPage crumb="TERMS OF SERVICE" title="TERMS OF SERVICE" updated="July 2026">
      <Section title="1. Using JD Academy">
        <p>By creating an account, you agree to use JD Academy for lawful purposes and to provide accurate information. You're responsible for keeping your login credentials safe.</p>
      </Section>
      <Section title="2. Students">
        <p>When you purchase a course or live session, you get access as described on the course page. Courses are for personal, non-commercial learning — please don't redistribute paid course materials.</p>
      </Section>
      <Section title="3. Teachers">
        <p>Teachers are responsible for the accuracy and quality of the courses they publish. By publishing a course, you confirm you have the rights to all content you upload (video, text, images, files). JD Academy takes a platform fee on paid sales, shown transparently at checkout and in your teacher dashboard.</p>
      </Section>
      <Section title="4. Payments & refunds">
        <p>Paid transactions are processed securely via Stripe. If something goes wrong with a purchase, contact support within 14 days and we'll review it on a case-by-case basis.</p>
      </Section>
      <Section title="5. Account termination">
        <p>We may suspend or terminate accounts that violate these terms (fraud, abuse, harassment, sharing paid content without authorization). You can also close your account at any time by contacting us.</p>
      </Section>
      <Section title="6. Limitation of liability">
        <p>JD Academy is provided "as is". We aim for high availability and accuracy but don't guarantee the platform will be error-free or uninterrupted at all times.</p>
      </Section>
      <Section title="7. Changes">
        <p>We may update these terms as the platform evolves. Continued use after a change means you accept the updated terms.</p>
      </Section>
    </LegalPage>
  );
}
