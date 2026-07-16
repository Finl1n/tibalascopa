import Link from "next/link";
import { navLinks } from "@/data/tibalascopa";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        tibalascopa
      </Link>

      <nav className="nav">
        {navLinks.map((item) => (
          <Link key={item.href} href={item.href as any} className="nav-link">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
