/**
 * SiteFooter — programme roles and contact.
 *
 * The roles below are verbatim from the programme brief. This footer is the
 * only place on the site where the Technology Partner appears.
 */
export default function SiteFooter() {
  return (
    <footer id="contact" className="bg-navy text-paper">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Identity */}
          <div className="md:col-span-4">
            <p className="flex items-baseline gap-3">
              <span className="font-kannada text-2xl font-semibold text-gold-soft">
                ಪೋಷಣೆ
              </span>
              <span className="font-serif text-2xl tracking-tight">
                Poshane
              </span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/70">
              The KSLSA Five Crore Sapling Plantation Programme — planted with
              rigour, protected by guardianship, verified on the ground.
            </p>
          </div>

          {/* Roles — verbatim */}
          <div className="md:col-span-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-kicker text-paper/50">
              Programme Roles
            </p>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="text-sm font-semibold text-paper">
                  Karnataka State Legal Services Authority
                </dt>
                <dd className="text-sm text-paper/70">Owning Authority</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-paper">
                  IAFT (Institute of Agroforestry, Farmers and Technologists)
                </dt>
                <dd className="text-sm text-paper/70">
                  Program Management &amp; Principal Scientific Advisor
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-paper">
                  Grobet India Agrotech
                </dt>
                <dd className="text-sm text-paper/70">Technology Partner</dd>
              </div>
            </dl>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-kicker text-paper/50">
              Contact
            </p>
            <address className="mt-5 space-y-2 text-sm not-italic leading-relaxed text-paper/70">
              <p>Programme Secretariat</p>
              <p>Karnataka State Legal Services Authority</p>
              <p>Bengaluru, Karnataka</p>
              <p>
                <a
                  href="mailto:contact@example.org"
                  className="text-paper underline decoration-paper/30 underline-offset-4 transition-colors hover:decoration-gold-soft"
                >
                  contact@example.org
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Karnataka State Legal Services Authority. All rights
            reserved.
          </p>
          <p className="italic">
            All programme figures shown on this site are illustrative unless
            verified via the Command Center.
          </p>
        </div>
      </div>
    </footer>
  );
}
