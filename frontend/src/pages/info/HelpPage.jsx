export function HelpPage() {
  const items = [
    {
      question: 'How do I register a Wari?',
      answer: 'From the Home screen, choose the Wari role and complete the registration form with source, destination, and organizer details.',
    },
    {
      question: 'How do I configure a route?',
      answer: 'Open the route section for the selected Wari and save the source and destination route details to generate the route summary.',
    },
    {
      question: 'How do I add daily halts?',
      answer: 'Use the Today\'s halts card to add halt name, coordinates, timing, and notes for the selected Wari.',
    },
    {
      question: 'How do I request food or water?',
      answer: 'Use the Food and Water cards to enter a quantity and notes, then submit the request for the current Wari.',
    },
    {
      question: 'Where can I see my request history?',
      answer: 'Visit the History section in the Dindi dashboard to review fulfilled, pending, and cancelled requests for the selected Wari.',
    },
  ];

  return (
    <main className="smartvari-info-page">
      <section className="smartvari-info-hero compact">
        <span className="smartvari-kicker">Help</span>
        <h1>Quick answers for your daily flow.</h1>
      </section>

      <section className="smartvari-help-grid">
        {items.map((item) => (
          <article key={item.question} className="smartvari-info-card faq-card">
            <h2>{item.question}</h2>
            <p>{item.answer}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
