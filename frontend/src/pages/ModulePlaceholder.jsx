import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

export default function ModulePlaceholder({ title, description, stage }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-2xl mx-auto my-8 shadow-sm">
      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Construction className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-600 mt-2">{description}</p>
      <div className="mt-4 inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
        Scheduled for Implementation in {stage}
      </div>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

