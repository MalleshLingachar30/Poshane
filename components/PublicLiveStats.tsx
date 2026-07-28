"use client";

import { DISTRICTS, TOT_NUR, fmtIN, lakhFix } from "@/app/command-center/data";
import { useLiveTotal, useLiveWSurv } from "@/app/command-center/live";

const LAKH = 100_000;

export default function PublicLiveStats() {
  const planted = useLiveTotal();
  const survival = useLiveWSurv();

  return (
    <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="border-l-2 border-gold pl-5">
        <dd className="font-serif text-3xl text-ink md:text-4xl">
          {lakhFix(planted, 2)}
        </dd>
        <dt className="mt-1 text-[0.72rem] font-semibold uppercase tracking-kicker text-ink-soft">
          Saplings Planted
        </dt>
        <p className="mt-2 text-xs text-bark">
          {fmtIN(planted * LAKH)} trees reported
        </p>
      </div>
      <div className="border-l-2 border-gold pl-5">
        <dd className="font-serif text-3xl text-ink md:text-4xl">
          {DISTRICTS.length}
        </dd>
        <dt className="mt-1 text-[0.72rem] font-semibold uppercase tracking-kicker text-ink-soft">
          Districts Active
        </dt>
        <p className="mt-2 text-xs text-bark">All districts reporting</p>
      </div>
      <div className="border-l-2 border-gold pl-5">
        <dd className="font-serif text-3xl text-ink md:text-4xl">
          {survival.toFixed(1)}%
        </dd>
        <dt className="mt-1 text-[0.72rem] font-semibold uppercase tracking-kicker text-ink-soft">
          Survival Rate
        </dt>
        <p className="mt-2 text-xs text-bark">Weighted by planted stock</p>
      </div>
      <div className="border-l-2 border-gold pl-5">
        <dd className="font-serif text-3xl text-ink md:text-4xl">
          {fmtIN(TOT_NUR)}
        </dd>
        <dt className="mt-1 text-[0.72rem] font-semibold uppercase tracking-kicker text-ink-soft">
          Nurseries
        </dt>
        <p className="mt-2 text-xs text-bark">Operational district capacity</p>
      </div>
    </dl>
  );
}
