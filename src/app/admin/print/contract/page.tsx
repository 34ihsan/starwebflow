import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/modules/auth/auth.helpers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

// Simple markdown → HTML converter (server-side, no deps)
function mdToHtml(md: string): string {
  if (!md) return '';
  let html = md
    // Headings
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered lists (simple)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br />');

  // Wrap consecutive <li> items in <ul>
  html = html.replace(/(<li>.*?<\/li>)(\s*(<li>.*?<\/li>))*/g, (match) => `<ul>${match}</ul>`);

  return `<p>${html}</p>`;
}

interface ContractPrintPageProps {
  searchParams: Promise<{ id?: string }>;
}

async function PrintContent({ contractId }: { contractId: string }) {
  const session = await getServerSession();
  if (!session?.tenantId) redirect('/admin');

  const tenantId = session.tenantId;

  const [contractRaw, settingsRaw] = await Promise.all([
    prisma.contract.findUnique({ where: { id: contractId } }),
    prisma.tenantSettings.findUnique({ where: { tenantId } }),
  ]);

  if (!contractRaw) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '4rem', textAlign: 'center', color: '#64748b' }}>
        <h2>Sözleşme bulunamadı</h2>
        <p>ID: {contractId}</p>
      </div>
    );
  }

  const prefs: any = (settingsRaw?.preferences as any) || {};
  const billing = prefs.billing || {};
  const general = prefs.general || {};

  const company = {
    name: billing.legalName || settingsRaw?.companyName || 'StarWebFlow Digital Agent',
    address: billing.address || 'Anilinerstr 3, 67105 Schifferstadt, Deutschland',
    taxId: billing.taxNumber || '',
    vatId: billing.vatId || '',
    email: general.supportEmail || 'info@starwebflow.com',
    website: general.website || 'www.starwebflow.com',
    phone: general.supportPhone || '+49 179 492 4556',
  };

  const contract = contractRaw as any;
  const docType: string = contract.type || 'CONTRACT';
  const docTypeName =
    docType === 'LASTENHEFT' ? 'LASTENHEFT / MÜŞTERİ TALEPLERİ' :
    docType === 'PFLICHTENHEFT' ? 'PFLICHTENHEFT / TEKNİK UYGULAMA ŞARTNAMESİ' :
    (docType === 'CONTRACT' || docType === 'MSA') ? 'B2B ANA HİZMET SÖZLEŞMESİ' :
    docType;

  const docNo = contract.contractNo || contract.id?.slice(0, 8)?.toUpperCase() || 'TASLAK';
  const dateStr = contract.createdAt
    ? new Date(contract.createdAt).toLocaleDateString('de-DE')
    : new Date().toLocaleDateString('de-DE');
  const valStr = contract.value
    ? `${Number(contract.value).toLocaleString('de-DE')} ${contract.currency || 'EUR'}`
    : 'Belirtilmedi';
  const clientName: string = contract.clientName || 'Müşteri';
  const clientEmail: string = contract.clientEmail || '';
  const isSigned = contract.status === 'SIGNED' || contract.status === 'signed';
  const contentHtml = mdToHtml(contract.content || '');

  return (
    <>
      {/* Auto-print script */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              // Give fonts 800ms to load before auto-print
              // (user can still manually click the button)
            });
          `,
        }}
      />

      <div className="no-print control-bar">
        <button onClick={undefined} id="btn-print" className="btn-print">
          🖨️ PDF Olarak Kaydet / Yazdır
        </button>
        <button id="btn-close" className="btn-close">
          ✕ Kapat
        </button>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.getElementById('btn-print').onclick = function() { window.print(); };
              document.getElementById('btn-close').onclick = function() { window.close(); };
            `,
          }}
        />
      </div>

      {/* ═══ COVER PAGE ═══ */}
      <div className="cover-page">
        {/* Accent bar via ::before in CSS */}
        <div className="cover-header">
          <div>
            <div className="cover-logo">{company.name.toUpperCase()}</div>
            <div className="cover-tagline">{company.website}</div>
          </div>
          <div className="cover-doc-no">Belge No: {docNo}</div>
        </div>

        <div className="cover-center">
          <span className="cover-badge">{docType} DOKÜMANI</span>
          <h1 className="cover-h1">{docTypeName}</h1>
          <div className="cover-rule" />
          <p className="cover-subtitle">{contract.title || 'Proje Belgesi'}</p>
        </div>

        <div className="cover-footer-grid">
          <div>
            <p className="grid-label">HAZIRLAYAN</p>
            <p className="grid-name">{company.name}</p>
            <p className="grid-detail">{company.address}</p>
            <p className="grid-detail">E: {company.email}</p>
            {company.taxId && <p className="grid-micro">St-Nr.: {company.taxId}</p>}
            {company.vatId && <p className="grid-micro">USt-IdNr.: {company.vatId}</p>}
          </div>
          <div>
            <p className="grid-label">MUHATAP / MÜŞTERİ</p>
            <p className="grid-name">{clientName}</p>
            {clientEmail && <p className="grid-detail">{clientEmail}</p>}
            <p className="grid-detail">Sözleşme Bedeli: {valStr}</p>
            <p className="grid-detail">Tarih: {dateStr}</p>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT PAGE ═══ */}
      <div className="content-page">
        <div className="content-header">
          <div>
            <span className="content-type-tag">{docTypeName}</span>
            <h2 className="content-title">{contract.title || 'Proje Belgesi'}</h2>
          </div>
          <span className="content-doc-no">Belge No: {docNo}</span>
        </div>

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <div className="sig-grid">
          <div className="sig-cell">
            <p className="sig-label">Hizmet Sağlayıcı İmza</p>
            <div className="sig-line">
              <span className="sig-cursive">{company.name.split(' ')[0]}</span>
            </div>
            <p className="sig-name">{company.name}</p>
            <p className="sig-status signed">✓ Dijital Olarak İmzalandı</p>
          </div>
          <div className="sig-cell">
            <p className="sig-label">Alıcı / Müşteri İmza</p>
            {isSigned ? (
              <>
                <div className="sig-line">
                  <span className="sig-cursive">{clientName.split(' ')[0]}</span>
                </div>
                <p className="sig-name">{clientName}</p>
                <p className="sig-status signed">✓ Dijital Olarak Onaylandı</p>
              </>
            ) : (
              <>
                <div className="sig-line pending">
                  <span className="sig-pending-text">İmza Bekliyor…</span>
                </div>
                <p className="sig-name">{clientName}</p>
                <p className="sig-status pending">○ İmza Bekleniyor</p>
              </>
            )}
          </div>
        </div>

        <div className="content-footer">
          <span>{company.name} · {company.address}</span>
          <span>Belge No: {docNo} · {dateStr}</span>
        </div>
      </div>
    </>
  );
}

export default async function ContractPrintPage({ searchParams }: ContractPrintPageProps) {
  const params = await searchParams;
  const contractId = params?.id;

  return (
    <html lang="de">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sözleşme — StarWebFlow</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          :root {
            --indigo: #4f46e5;
            --cyan:   #06b6d4;
            --slate-900: #0f172a;
            --slate-800: #1e293b;
            --slate-700: #334155;
            --slate-500: #64748b;
            --slate-400: #94a3b8;
            --slate-200: #e2e8f0;
            --slate-100: #f1f5f9;
            --slate-50:  #f8fafc;
            --emerald:   #059669;
            --red:       #dc2626;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--slate-50);
            color: var(--slate-800);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            line-height: 1.6;
          }

          /* ─── Control Bar ─── */
          .control-bar {
            position: sticky;
            top: 0;
            z-index: 100;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            align-items: center;
            background: rgba(255,255,255,0.92);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--slate-200);
            padding: 0.875rem 2rem;
          }
          .btn-print {
            background: linear-gradient(135deg, var(--indigo), #6366f1);
            color: #fff;
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            letter-spacing: 0.01em;
            box-shadow: 0 2px 8px rgba(79,70,229,0.35);
            transition: all 0.2s;
          }
          .btn-print:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 14px rgba(79,70,229,0.45);
          }
          .btn-close {
            background: #fff;
            color: var(--slate-700);
            border: 1px solid var(--slate-200);
            padding: 0.6rem 1.25rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.15s;
          }
          .btn-close:hover { background: var(--slate-100); }

          /* ─── Page wrapper ─── */
          .page-wrap {
            max-width: 960px;
            margin: 0 auto;
            padding: 2.5rem 2rem 4rem;
          }

          /* ─── Cover Page ─── */
          .cover-page {
            background: #fff;
            border-radius: 1.25rem;
            border: 1px solid var(--slate-200);
            box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
            padding: 64px 72px;
            min-height: 277mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            margin-bottom: 2.5rem;
          }
          .cover-page::before {
            content: '';
            position: absolute;
            inset-block-start: 0;
            inset-inline: 0;
            height: 5px;
            background: linear-gradient(90deg, var(--indigo) 0%, var(--cyan) 100%);
          }
          .cover-page::after {
            content: '';
            position: absolute;
            inset-block-end: 0;
            inset-inline-end: 0;
            width: 320px;
            height: 320px;
            background: radial-gradient(circle at 100% 100%, rgba(79,70,229,0.06) 0%, transparent 70%);
            pointer-events: none;
          }

          .cover-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--slate-100);
          }
          .cover-logo {
            font-size: 1.375rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            color: var(--slate-900);
          }
          .cover-tagline {
            font-size: 0.75rem;
            color: var(--slate-400);
            margin-top: 0.3rem;
            letter-spacing: 0.01em;
          }
          .cover-doc-no {
            font-size: 0.7rem;
            color: var(--slate-400);
            font-family: ui-monospace, 'Cascadia Code', monospace;
            background: var(--slate-50);
            border: 1px solid var(--slate-200);
            padding: 0.3rem 0.65rem;
            border-radius: 0.375rem;
          }

          .cover-center {
            padding: 4rem 0 3rem;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .cover-badge {
            display: inline-block;
            font-size: 0.65rem;
            font-weight: 700;
            color: var(--indigo);
            letter-spacing: 0.12em;
            text-transform: uppercase;
            background: rgba(79,70,229,0.07);
            border: 1px solid rgba(79,70,229,0.15);
            padding: 0.3rem 0.75rem;
            border-radius: 9999px;
            margin-bottom: 1.5rem;
          }
          .cover-h1 {
            font-size: 2.75rem;
            font-weight: 800;
            line-height: 1.15;
            letter-spacing: -0.035em;
            color: var(--slate-900);
            margin-bottom: 1.75rem;
          }
          .cover-rule {
            width: 56px;
            height: 4px;
            border-radius: 9999px;
            background: linear-gradient(90deg, var(--indigo), var(--cyan));
            margin-bottom: 1.5rem;
          }
          .cover-subtitle {
            font-size: 1.2rem;
            font-weight: 500;
            color: var(--slate-500);
            line-height: 1.5;
          }

          .cover-footer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
            border-top: 1px solid var(--slate-100);
            padding-top: 2rem;
          }
          .grid-label {
            font-size: 0.65rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--slate-400);
            margin-bottom: 0.6rem;
          }
          .grid-name {
            font-size: 0.9375rem;
            font-weight: 700;
            color: var(--slate-900);
            margin-bottom: 0.25rem;
          }
          .grid-detail {
            font-size: 0.8rem;
            color: var(--slate-500);
            margin-bottom: 0.2rem;
          }
          .grid-micro {
            font-size: 0.7rem;
            color: var(--slate-400);
            font-family: ui-monospace, monospace;
            margin-bottom: 0.15rem;
          }

          /* ─── Content Page ─── */
          .content-page {
            background: #fff;
            border-radius: 1.25rem;
            border: 1px solid var(--slate-200);
            box-shadow: 0 8px 30px rgba(0,0,0,0.05);
            padding: 64px 72px 72px;
            position: relative;
          }
          .content-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 2px solid var(--slate-900);
            padding-bottom: 1rem;
            margin-bottom: 2.5rem;
          }
          .content-type-tag {
            display: block;
            font-size: 0.65rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--indigo);
            margin-bottom: 0.35rem;
          }
          .content-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--slate-900);
            letter-spacing: -0.02em;
          }
          .content-doc-no {
            font-size: 0.7rem;
            color: var(--slate-400);
            font-family: ui-monospace, monospace;
            white-space: nowrap;
          }

          /* ─── Prose ─── */
          .prose {
            font-size: 0.9rem;
            line-height: 1.85;
            color: var(--slate-700);
          }
          .prose h1 {
            font-size: 1.4rem;
            font-weight: 700;
            color: var(--slate-900);
            border-bottom: 1px solid var(--slate-200);
            padding-bottom: 0.5rem;
            margin: 2rem 0 1rem;
            letter-spacing: -0.02em;
          }
          .prose h2 {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--slate-800);
            border-bottom: 1px solid var(--slate-100);
            padding-bottom: 0.35rem;
            margin: 1.75rem 0 0.75rem;
          }
          .prose h3 {
            font-size: 1rem;
            font-weight: 700;
            color: var(--slate-800);
            margin: 1.5rem 0 0.5rem;
          }
          .prose h4 {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--slate-700);
            margin: 1rem 0 0.4rem;
          }
          .prose p {
            margin-bottom: 1rem;
            text-align: justify;
          }
          .prose strong { font-weight: 600; color: var(--slate-900); }
          .prose em { font-style: italic; }
          .prose ul, .prose ol {
            padding-left: 1.5rem;
            margin-bottom: 1rem;
          }
          .prose ul { list-style: disc; }
          .prose ol { list-style: decimal; }
          .prose li { margin-bottom: 0.35rem; }
          .prose hr {
            border: none;
            border-top: 1px solid var(--slate-200);
            margin: 1.5rem 0;
          }

          /* ─── Signature Block ─── */
          .sig-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            border-top: 1px solid var(--slate-200);
            padding-top: 2.5rem;
            margin-top: 3rem;
          }
          .sig-cell { text-align: center; }
          .sig-label {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--slate-400);
            margin-bottom: 2rem;
          }
          .sig-line {
            height: 3.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid var(--slate-200);
            margin-bottom: 0.75rem;
          }
          .sig-line.pending {
            border-bottom: 1px dashed var(--slate-200);
          }
          .sig-cursive {
            font-family: 'Playfair Display', Georgia, serif;
            font-style: italic;
            font-size: 2rem;
            font-weight: 500;
            color: var(--indigo);
          }
          .sig-pending-text {
            font-size: 0.875rem;
            color: var(--slate-300);
            font-style: italic;
          }
          .sig-name {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--slate-800);
            margin-bottom: 0.3rem;
          }
          .sig-status {
            font-size: 0.7rem;
            font-weight: 500;
          }
          .sig-status.signed { color: var(--emerald); }
          .sig-status.pending { color: var(--slate-400); }

          /* ─── Footer ─── */
          .content-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid var(--slate-100);
            font-size: 0.7rem;
            color: var(--slate-400);
          }

          /* ─── Print ─── */
          @media print {
            body { background: #fff; }
            .no-print { display: none !important; }
            .page-wrap { padding: 0; max-width: 100%; }
            .cover-page {
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              margin-bottom: 0 !important;
              min-height: 100vh !important;
              page-break-after: always !important;
              break-after: page !important;
              padding: 56px 60px !important;
            }
            .content-page {
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              padding: 48px 60px !important;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="no-print control-bar">
          <button id="btn-print" className="btn-print">🖨️ PDF Olarak Kaydet / Yazdır</button>
          <button id="btn-close" className="btn-close">✕ Kapat</button>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                document.getElementById('btn-print').onclick = function() { window.print(); };
                document.getElementById('btn-close').onclick = function() { window.close(); };
              `,
            }}
          />
        </div>
        <div className="page-wrap">
          {contractId ? (
            <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>Yükleniyor…</div>}>
              <PrintContent contractId={contractId} />
            </Suspense>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>
              <h2 style={{ marginBottom: '1rem' }}>Sözleşme ID Eksik</h2>
              <p>URL&apos;de <code>?id=</code> parametresi bulunamadı.</p>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
