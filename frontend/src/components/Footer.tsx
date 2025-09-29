import Link from "next/link";
import { Leaf, Facebook, Twitter, Instagram, Mail, type LucideIcon } from "lucide-react";
import clsx from "clsx";

type NavLink = { label: string; href: string; external?: boolean };
type NavColumn = { title: string; links: NavLink[] };

type SocialKind = "facebook" | "twitter" | "instagram" | "mail" | "custom";
type SocialLink = {
  kind: SocialKind;
  href: string;
  label?: string;
  icon?: LucideIcon;
};

export type FooterProps = {
  brandName: string;
  description?: string;
  nav?: NavColumn[];
  socials?: SocialLink[];
  year?: number;
  className?: string;
};

const socialIcon: Record<Exclude<SocialKind, "custom">, LucideIcon> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  mail: Mail
};

function isExternal(href: string) {
  return /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

export function Footer({
  brandName,
  description,
  nav = [],
  socials = [],
  year = new Date().getFullYear(),
  className
}: FooterProps) {
  return (
    <footer className={clsx("bg-gray-900 text-white py-16", className)}>
      <div className="container mx-auto px-4">
        <div className={clsx("gap-8 mb-12", nav.length ? "grid grid-cols-1 md:grid-cols-4" : "grid grid-cols-1")}>
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full grid place-items-center">
                <Leaf className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                {brandName}
              </span>
            </div>
            {description && (
              <p className="text-gray-400 leading-relaxed">{description}</p>
            )}
            {socials.length > 0 && (
              <div className="flex items-center gap-4">
                {socials.map((s, i) => {
                  const Icon = s.icon ?? (s.kind !== "custom" ? socialIcon[s.kind] : undefined);
                  const label = s.label ?? s.kind;
                  const external = isExternal(s.href);

                  const linkProps = {
                    key: `${label}-${i}`,
                    className: "inline-flex",
                    "aria-label": label,
                    ...(external
                      ? { href: s.href, target: "_blank", rel: "noopener noreferrer" }
                      : { href: s.href })
                  };

                  return external ? (
                    <a {...linkProps}>
                      {Icon ? (
                        <Icon className="w-5 h-5 text-gray-400 hover:text-emerald-400 transition-colors" />
                      ) : (
                        <span className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                          {label}
                        </span>
                      )}
                    </a>
                  ) : (
                    <Link {...linkProps}>
                      {Icon ? (
                        <Icon className="w-5 h-5 text-gray-400 hover:text-emerald-400 transition-colors" />
                      ) : (
                        <span className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                          {label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nav columns */}
          {nav.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2 text-gray-400">
                {col.links.map((l) => {
                  const external = l.external ?? isExternal(l.href);
                  const linkProps = {
                    className: "hover:text-emerald-400 transition-colors",
                    ...(external
                      ? { href: l.href, target: "_blank", rel: "noopener noreferrer" }
                      : { href: l.href })
                  };

                  return (
                    <li key={`${col.title}-${l.label}`}>
                      {external ? (
                        <a {...linkProps}>
                          {l.label}
                        </a>
                      ) : (
                        <Link {...linkProps}>
                          {l.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">© {year} {brandName}. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            {/* slot for policies/links */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


