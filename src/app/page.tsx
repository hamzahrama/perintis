import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-layout">
      <header className="landing-header">
        <Link className="brand" href="/">
          PERINTIS
        </Link>
        <div className="landing-actions">
          <nav aria-label="Akun" className="landing-actions">
            <Link className="button button--secondary" href="/login">
              Masuk
            </Link>
            <Link className="button button--primary" href="/register">
              Buat akun
            </Link>
          </nav>
        </div>
      </header>
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Personal Growth Guidance Platform</p>
          <h1 className="landing-title">Mulai Hari Ini. Bangun Masa Depanmu.</h1>
          <p className="landing-description">
            Pendamping untuk mengubah niat pengembangan diri menjadi langkah
            kecil yang realistis dan berkelanjutan.
          </p>
          <div className="landing-cta">
            <Link className="button button--primary" href="/register">
              Mulai dengan buat akun
            </Link>
            <Link className="button button--secondary" href="/login">
              Saya sudah punya akun
            </Link>
          </div>
        </div>
        <aside className="card landing-note">
          <h2>Mulai dari langkah yang terasa mungkin</h2>
          <p>
            PERINTIS mendukung proses yang kamu pilih sendiri, tanpa tuntutan
            untuk selalu sempurna.
          </p>
        </aside>
      </section>
    </main>
  );
}
