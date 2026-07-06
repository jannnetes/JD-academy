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

// PLACEHOLDER — fields in [brackets] need your real registered business
// details (see also /impressum). Have this reviewed once you're set up as
// self-employed — this is a starting template, not legal advice.
export function PrivacyPolicy() {
  return (
    <LegalPage crumb="PRIVACY POLICY" title="PRIVACY POLICY" updated="July 2026">
      <Section title="1. Who is responsible (data controller)">
        <p>[Your full name], [your address], [your email] — see our <a href="/impressum">Impressum</a> for full details. This is the "controller" under Art. 4(7) GDPR for the data described below.</p>
      </Section>
      <Section title="2. What we collect and why (legal basis)">
        <p>Account data (name, email, password hash) — collected at registration, necessary to provide the service (Art. 6(1)(b) GDPR — performance of a contract). Teacher profile data (bio, expertise) — provided voluntarily by teachers (Art. 6(1)(a) — consent). Payment data — handled entirely by Stripe when enabled; we never see or store your card number (Art. 6(1)(b)). Analytics/cookie data — only collected after you accept the cookie banner (Art. 6(1)(a) — consent), see section 4.</p>
      </Section>
      <Section title="3. Third-party processors">
        <p>We use SendGrid (USA) to deliver transactional emails, Railway and Netlify to host our servers and website, and Stripe (when enabled) to process payments. Where a processor is based outside the EU/EEA (e.g. the USA), data transfer relies on that provider's Standard Contractual Clauses / adequacy mechanisms. Each provider only processes data necessary to perform their service for us.</p>
      </Section>
      <Section title="4. Cookies & analytics">
        <p>We use your browser's local storage to keep you signed in and to remember your language/theme — this is necessary for the site to function and doesn't require consent. With your explicit consent (cookie banner), we also use Google Analytics and/or Meta Pixel to understand site usage and measure ad performance. You can withdraw consent at any time by clearing your browser's local storage for this site.</p>
      </Section>
      <Section title="5. How long we keep it">
        <p>Account data is kept while your account is active. If you delete your account, we remove your personal data, except records we're legally required to retain (e.g. completed transactions, for tax/accounting purposes under German commercial law).</p>
      </Section>
      <Section title="6. Your rights (Art. 15–21 GDPR)">
        <p>You have the right to access, correct, delete, or export your data, and to object to or restrict certain processing. To exercise any of these, contact us using the details above. You also have the right to lodge a complaint with your local data protection supervisory authority.</p>
      </Section>
      <Section title="7. Contact">
        <p>Questions about this policy? Reach us via the contact options on our Help &amp; Support page, or email us directly at [your@email.com].</p>
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

// PLACEHOLDER — replace every [bracketed] field with your real registered
// business details once you're set up (required by §5 TMG / German law for
// any commercial website reachable from Germany).
export function Impressum() {
  return (
    <LegalPage crumb="IMPRESSUM" title="IMPRESSUM" updated="July 2026">
      <Section title="Angaben gemäß § 5 TMG">
        <p>
          [Your full name]<br />
          [Street address]<br />
          [Postal code, City]<br />
          [Country]
        </p>
      </Section>
      <Section title="Kontakt">
        <p>
          E-Mail: [your@email.com]<br />
          Telefon: [optional]
        </p>
      </Section>
      <Section title="Umsatzsteuer-ID">
        <p>[Your VAT ID if applicable, or: "Kein Ausweis der Umsatzsteuer gemäß § 19 UStG (Kleinunternehmerregelung)."]</p>
      </Section>
      <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>[Your full name and address, same as above]</p>
      </Section>
      <Section title="Streitschlichtung">
        <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">https://ec.europa.eu/consumers/odr</a>. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      </Section>
    </LegalPage>
  );
}
