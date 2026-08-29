export function AboutUsPage() {
  return (
    <main className="smartvari-info-page">
      <section className="smartvari-info-hero">
        <span className="smartvari-kicker">About SmartVari</span>
        <h1>Coordinating Wari operations with clarity.</h1>
      </section>

      <section className="smartvari-info-grid">
        <article className="smartvari-info-card">
          <h2>What SmartVari does</h2>
          <p>
            SmartVari is a resource coordination platform designed to help manage Wari operations by connecting
            Wari organizers, Dindi leaders, Warkaris and service providers.
          </p>
        </article>

        <article className="smartvari-info-card">
          <h2>Why it matters</h2>
          <p>
            Coordinating routes, food and water requests, daily halts, and live updates requires clear visibility for
            everyone involved in the journey.
          </p>
        </article>

        <article className="smartvari-info-card">
          <h2>Who it supports</h2>
          <p>
            From route planning and service requests to daily logistics and community support, SmartVari keeps each
            role aligned around the same operational picture.
          </p>
        </article>
      </section>
    </main>
  );
}
