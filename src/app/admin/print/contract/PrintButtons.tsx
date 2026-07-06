'use client';

export function PrintButtons() {
  return (
    <div className="no-print control-bar">
      <button
        className="btn-print"
        onClick={() => window.print()}
      >
        🖨️ PDF Olarak Kaydet / Yazdır
      </button>
      <button
        className="btn-close"
        onClick={() => window.close()}
      >
        ✕ Kapat
      </button>
    </div>
  );
}
