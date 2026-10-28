import { NextResponse } from 'next/server';
import { getSectorEmailBundle, compileEmailTemplate } from '@/lib/leads/email-templates';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blueprintId = "ev_charging_infrastructure", lead, lang = "de", templateType = "cold", customSubject, customBody } = body;

    const bundle = getSectorEmailBundle(blueprintId);
    const langKey = (lang === "tr" || lang === "en" || lang === "de") ? lang : "de";
    
    let baseTemplate = bundle[langKey].cold;
    if (templateType === "warmFollowUp") {
      baseTemplate = bundle[langKey].warmFollowUp;
    }

    const templateToUse = {
      subject: customSubject || baseTemplate.subject,
      bodyText: customBody || baseTemplate.bodyText
    };

    const compiled = compileEmailTemplate({
      template: templateToUse,
      lead: lead || {
        id: "preview-id",
        company: "Muster GmbH",
        decisionMakerName: "Dr. Stefan Weber",
        location: "Frankfurt am Main",
        email: "kontakt@muster-gmbh.de"
      },
      lang: langKey
    });

    return NextResponse.json({
      success: true,
      compiled,
      rawTemplate: baseTemplate
    });
  } catch (error: any) {
    console.error("[Email Preview API Error]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
