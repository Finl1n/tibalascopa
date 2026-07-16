type HeroSectionProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function HeroSection({
  title,
  description,
  actionLabel = "Abrir agente",
  actionHref = "/agente",
}: HeroSectionProps) {
  return (
    <section className="hero">
      <header className="topbar">
        <div>
          <p className="eyebrow">tibalascopa</p>
          <h1>{title}</h1>
        </div>
        <a className="button button-ghost" href={actionHref}>
          {actionLabel}
        </a>
      </header>

      <article className="panel panel-primary">
        <p className="section-label">Visão geral</p>
        <h2>Dados da copa com leitura rápida e foco em clareza.</h2>
        <p className="muted">{description}</p>
      </article>
    </section>
  );
}
