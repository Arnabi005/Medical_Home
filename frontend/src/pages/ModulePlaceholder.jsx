import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

export default function ModulePlaceholder({ title, description, stage }) {
  return (
    <div className="bg-white rounded-2xl border border-lightblue-200 p-8 text-center max-w-2xl mx-auto my-8 shadow-xl shadow-lightblue-950/5 text-slate-800">
      <div className="w-14 h-14 bg-lightblue-50 border border-lightblue-200 text-lightblue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Construction className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-black text-slate-900">{title}</h2>
      <p className="text-sm text-slate-600 mt-2">{description}</p>
      <div className="mt-4 inline-block px-3 py-1 bg-neonrose-50 text-neonrose-700 text-xs font-bold rounded-full border border-neonrose-200 shadow-xs">
        Scheduled for Implementation in {stage}
      </div>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-bold text-lightblue-700 hover:text-lightblue-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
