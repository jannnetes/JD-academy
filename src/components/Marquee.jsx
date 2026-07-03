// Moving testimonial ribbon (Linear/Framer style), warm palette.
export default function Marquee({ items, reverse = false }) {
  const list = items?.length
    ? items
    : [
        { name: "Maria", review: "My English improved in just a month!" },
        { name: "Oleg", review: "Convenient format, live lessons are great." },
        { name: "Irina", review: "I finally understand math 🙌" },
        { name: "Dmitry", review: "The best exam prep out there." },
        { name: "Natalie", review: "Teachers really explain things clearly." },
      ];
  const doubled = [...list, ...list];

  return (
    <section className="marquee-section">
      <div className="marquee-fade left" />
      <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
        {doubled.map((r, i) => (
          <article className="marquee-card" key={`${r.name}-${i}`}>
            <p className="review-text">“{r.review}”</p>
            <span className="review-name">{r.name}</span>
          </article>
        ))}
      </div>
      <div className="marquee-fade right" />
    </section>
  );
}
