import { useState } from "react";
import { findPlanByDbId } from "@/data/plans";
import { getFirstPayment, formatNaira } from "@/utils/pricing";

interface Props {
  dbPlanId: number;
}

export function PricingDebugPanel({ dbPlanId }: Props) {
  const [open, setOpen] = useState(false);

  if (!import.meta.env.DEV) return null;

  const plan = findPlanByDbId(dbPlanId);

  return (
    <div className="fixed bottom-4 left-4 z-[9999] font-mono text-[11px]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-yellow-400 text-black font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg hover:bg-yellow-300 transition-colors"
      >
        {open ? "✕ Close Debug" : "🐛 Pricing Debug"}
      </button>

      {open && (
        <div className="mt-2 bg-black border-2 border-yellow-400 rounded-xl p-4 w-72 shadow-2xl space-y-2">
          <p className="text-yellow-400 font-black uppercase tracking-widest text-[10px] mb-3">
            Pricing Debug Panel · DEV ONLY
          </p>

          {plan ? (
            <>
              <Row label="Plan ID" value={plan.id} />
              <Row label="DB ID" value={String(plan.dbId)} />
              <Row label="Name" value={plan.name} />
              <Row label="Category" value={plan.category} />
              <Row label="Monthly Price" value={formatNaira(plan.monthlyPrice)} highlight />
              <Row label="Hardware Fee" value={formatNaira(plan.hardwareFee)} highlight />
              <Row label="First Payment" value={formatNaira(getFirstPayment(plan))} highlight />
              <Row label="USD Monthly" value={`$${plan.usdMonthly}`} />
              <Row label="USD Hardware" value={`$${plan.usdHardware}`} />
              <Row label="Speed" value={plan.speed} />
              <div className="pt-2 border-t border-yellow-400/30">
                <p className="text-yellow-600 text-[9px] font-bold uppercase">Source</p>
                <p className="text-yellow-300">/src/data/plans.ts</p>
              </div>
            </>
          ) : (
            <p className="text-red-400 font-bold">
              ⚠ No plan found for dbId={dbPlanId}
              <br />
              <span className="text-red-300 text-[10px]">Check /src/data/plans.ts</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-right ${highlight ? "text-yellow-300 font-black" : "text-gray-200"}`}>
        {value}
      </span>
    </div>
  );
}
