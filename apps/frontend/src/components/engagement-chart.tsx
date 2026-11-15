"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { day: "Mon", mentions: 180 }, { day: "Tue", mentions: 260 },
  { day: "Wed", mentions: 220 }, { day: "Thu", mentions: 410 },
  { day: "Fri", mentions: 350 }, { day: "Sat", mentions: 510 },
  { day: "Sun", mentions: 620 },
];

export function EngagementChart() {
  return (
    <figure aria-label="Demo conversation volume over seven days">
      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 256 }}>
          <AreaChart data={data} margin={{ top: 15, right: 15, bottom: 0, left: -20 }}>
            <defs><linearGradient id="volume-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity={0.22} /><stop offset="100%" stopColor="#0f766e" stopOpacity={0.01} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
            <Area type="monotone" dataKey="mentions" stroke="#0f766e" strokeWidth={3} fill="url(#volume-fill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">Illustrative mentions: Monday 180, Tuesday 260, Wednesday 220, Thursday 410, Friday 350, Saturday 510, Sunday 620. Not live data.</figcaption>
    </figure>
  );
}
