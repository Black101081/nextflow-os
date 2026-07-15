import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  headers: string[];
  children: React.ReactNode;
}

export default function Table({ headers, children, className = '', ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#242936] bg-[#12141c]/40 backdrop-blur-sm">
      <table className={`w-full border-collapse text-left text-sm ${className}`} {...props}>
        <thead>
          <tr className="border-b border-[#242936] bg-[#1a1d29]/60">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#242936] bg-transparent">
          {children}
        </tbody>
      </table>
    </div>
  );
}
