// Temporary stand-in until each page is built.
export default function Placeholder({ title }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-title font-semibold text-fg">{title}</h1>
    </main>
  );
}
