export function ContactUsPage() {
  return (
    <main className="smartvari-info-page">
      <section className="smartvari-info-hero compact">
        <span className="smartvari-kicker">Contact Us</span>
        <h1>We’re here to help.</h1>
      </section>

      <section className="smartvari-contact-wrap">
        <article className="smartvari-info-card contact-card">
          <h2>Get in touch</h2>
          <p>
            For support, coordination, or partnership inquiries, send a message using the form below. Placeholder
            details are being used until real contact information is available.
          </p>

          <div className="smartvari-contact-meta">
            <span>Email: hello@smartvari.example</span>
            <span>Response time: 1–2 business days</span>
          </div>
        </article>

        <form className="smartvari-contact-form">
          <label>
            <span>Name</span>
            <input type="text" placeholder="Your name" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            <span>Message</span>
            <textarea rows={5} placeholder="Tell us how we can help..." />
          </label>
          <button type="button" className="smartvari-primary-button">Send message</button>
        </form>
      </section>
    </main>
  );
}
