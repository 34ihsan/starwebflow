'use client'

import { useEffect, useRef } from 'react'

export default function ContractPreview({ htmlContent }: { htmlContent: string }) {
  const previewRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col h-full bg-[#E2E8F0] relative">
      <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center justify-center z-10 shadow-sm">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">A4 Live Preview</span>
      </div>
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-auto p-8 pt-20 flex justify-center custom-scrollbar">
        {/* A4 Paper Illustration */}
        <div 
          className="bg-white shadow-2xl shrink-0 prose prose-sm prose-gray max-w-none text-black p-12"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          {/* Header/Logo placeholder */}
          <div className="flex justify-between items-start border-b border-gray-300 pb-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black flex items-center justify-center rounded">
                <span className="text-white font-bold text-xs">SW</span>
              </div>
              <span className="font-bold text-lg font-['Outfit']">StarWebFlow</span>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>Münchener Str. 12</p>
              <p>80331 München, Almanya</p>
              <p>info@starwebflow.de</p>
            </div>
          </div>

          {/* Dynamic Content inserted here */}
          <div 
            ref={previewRef}
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
            className="prose-h1:text-2xl prose-h1:font-bold prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700"
          />

          {/* Signature Block Placeholder */}
          <div className="mt-24 pt-12 border-t border-gray-300 grid grid-cols-2 gap-12">
            <div>
              <p className="font-bold text-sm mb-12">Müşteri / Client</p>
              <div className="border-b border-gray-400 w-full" />
              <p className="text-xs text-gray-500 mt-2">Tarih ve İmza</p>
            </div>
            <div>
              <p className="font-bold text-sm mb-12">StarWebFlow Agency</p>
              <div className="border-b border-gray-400 w-full" />
              <p className="text-xs text-gray-500 mt-2">Tarih ve İmza</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
