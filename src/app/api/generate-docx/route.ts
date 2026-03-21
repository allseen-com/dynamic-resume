/**
 * ATS-friendly DOCX generation for the mother resume.
 * Single-column layout, standard section headers, no tables/graphics (per ATS best practices).
 */
import { NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
} from "docx";
import type { ResumeData, ResumeConfig } from "../../../types/resume";
import { defaultResumeConfig } from "../../../types/resume";

type FlexibleField = string | { value: string };
type FlexibleResumeData = {
  header: { name: FlexibleField; address: FlexibleField; email: FlexibleField; phone: FlexibleField };
  summary: FlexibleField;
  coreCompetencies: { value: string[] } | string[];
  technicalProficiency: {
    footnote?: FlexibleField;
    categories?: { category: string; items: string[] }[];
    programming?: string[];
    cloudData?: string[];
    analytics?: string[];
    mlAi?: string[];
    productivity?: string[];
    marketingAds?: string[];
  };
  professionalExperience: {
    company: FlexibleField;
    title: FlexibleField;
    dateRange: FlexibleField;
    description: FlexibleField;
  }[];
  education: { value: { school: string; dateRange: string; degree: string }[] };
  certifications: { value: string[] } | string[];
};

function getVal(f: FlexibleField): string {
  if (typeof f === "object" && f !== null && "value" in f) return (f as { value: string }).value;
  return (f as string) ?? "";
}

function getArr<T>(x: T[] | { value: T[] }): T[] {
  if (Array.isArray(x)) return x;
  if (x && typeof x === "object" && "value" in x && Array.isArray((x as { value: T[] }).value))
    return (x as { value: T[] }).value;
  return [];
}

function buildDocx(resumeData: FlexibleResumeData, config: ResumeConfig): Document {
  const data = resumeData as FlexibleResumeData;
  const cfg = config ?? defaultResumeConfig;
  const name = getVal(data.header.name);
  const address = getVal(data.header.address);
  const email = getVal(data.header.email);
  const phone = getVal(data.header.phone);
  const contactLine = [address, email, phone].filter(Boolean).join(" | ");

  const sectionHeader = (text: string) =>
    new Paragraph({
      text,
      heading: HeadingLevel.HEADING_2,
      thematicBreak: true,
      spacing: { before: 240, after: 120 },
    });

  const bodyParagraph = (text: string) =>
    new Paragraph({
      children: [new TextRun({ text, size: 22 })],
      spacing: { after: 120 },
    });

  const children: Paragraph[] = [];

  // Header: name + contact (ATS: contact in body)
  children.push(
    new Paragraph({
      children: [new TextRun({ text: name, bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: contactLine, size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
    })
  );

  // Title bar from config
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: getVal(cfg.titleBar.main as FlexibleField),
          bold: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: getVal(cfg.titleBar.sub as FlexibleField),
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
    })
  );

  // Professional Summary
  const summaryText = getVal(data.summary);
  if (summaryText) {
    children.push(sectionHeader("Professional Summary"));
    summaryText.split(/\n\n+/).forEach((p) => {
      if (p.trim()) children.push(bodyParagraph(p.trim()));
    });
  }

  // Skills (Core Competencies)
  const competencies = getArr(
    Array.isArray(data.coreCompetencies) ? data.coreCompetencies : data.coreCompetencies.value
  );
  if (cfg.sections.showCoreCompetencies && competencies.length > 0) {
    children.push(sectionHeader("Skills"));
    competencies.forEach((item) => {
      if (item && String(item).trim()) {
        children.push(
          new Paragraph({
            text: String(item).trim(),
            bullet: { level: 0 },
            spacing: { after: 60 },
          })
        );
      }
    });
  }

  // Technical Skills (by category, ATS-friendly)
  if (cfg.sections.showTechnicalProficiency && data.technicalProficiency) {
    const tech = data.technicalProficiency;
    const categories = tech.categories?.length
      ? tech.categories
      : [
          { category: "Programming", items: tech.programming || [] },
          { category: "Cloud / Data", items: tech.cloudData || [] },
          { category: "Analytics", items: tech.analytics || [] },
          { category: "ML / AI", items: tech.mlAi || [] },
          { category: "Productivity", items: tech.productivity || [] },
          { category: "Marketing / Ads", items: tech.marketingAds || [] },
        ].filter((g) => g.items.length > 0);
    if (categories.length > 0) {
      children.push(sectionHeader("Technical Skills"));
      for (const group of categories) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${group.category}: `, bold: true, size: 22 }),
              new TextRun({ text: group.items.join(", "), size: 22 }),
            ],
            spacing: { after: 80 },
          })
        );
      }
      const footnoteRaw = tech.footnote;
      const footnoteText = footnoteRaw ? getVal(footnoteRaw as FlexibleField).trim() : "";
      if (footnoteText) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: footnoteText, italics: true, size: 20 })],
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  // Work Experience
  const experiences = data.professionalExperience || [];
  if (cfg.sections.showProfessionalExperience && experiences.length > 0) {
    children.push(sectionHeader("Work Experience"));
    experiences.forEach((role: { company: FlexibleField; title: FlexibleField; dateRange: FlexibleField; description: FlexibleField }) => {
      const company = getVal(role.company);
      const title = getVal(role.title);
      const dateRange = getVal(role.dateRange);
      const desc = getVal(role.description);
      if (!company && !title) return;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: company || "", bold: true, size: 22 }),
            new TextRun({ text: dateRange ? `  ${dateRange}` : "", size: 22 }),
          ],
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: title || "", bold: true, size: 22 })],
          spacing: { after: 80 },
        })
      );
      if (desc && desc.trim()) {
        desc.split(/\n+/).forEach((line) => {
          if (line.trim())
            children.push(
              new Paragraph({
                text: line.trim(),
                bullet: { level: 0 },
                spacing: { after: 60 },
              })
            );
        });
      }
      children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    });
  }

  // Education
  const educationList = getArr(data.education?.value ?? []);
  if (cfg.sections.showEducation && educationList.length > 0) {
    children.push(sectionHeader("Education"));
    educationList.forEach((edu: { school: string; dateRange: string; degree: string }) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.school || "", bold: true, size: 22 }),
            new TextRun({ text: edu.dateRange ? `  ${edu.dateRange}` : "", size: 22 }),
          ],
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: edu.degree || "", size: 22 })],
          spacing: { after: 120 },
        })
      );
    });
  }

  // Certifications
  const certs = getArr(
    Array.isArray(data.certifications) ? data.certifications : data.certifications?.value ?? []
  );
  if (cfg.sections.showCertifications && certs.length > 0) {
    children.push(sectionHeader("Certifications"));
    certs.forEach((c) => {
      if (c && String(c).trim())
        children.push(
          new Paragraph({
            text: String(c).trim(),
            bullet: { level: 0 },
            spacing: { after: 60 },
          })
        );
    });
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.5),
              right: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.5),
            },
          },
        },
        children,
      },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resumeData: ResumeData = body.resumeData;
    const config: ResumeConfig = body.config ?? defaultResumeConfig;
    const filename: string | undefined = body.filename;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Missing resumeData" },
        { status: 400 }
      );
    }

    const doc = buildDocx(resumeData as unknown as FlexibleResumeData, config);
    const buffer = await Packer.toBuffer(doc);
    const docxBytes = new Uint8Array(buffer);

    const safeName =
      filename && /^[\w\s\-\.]+\.docx$/i.test(filename)
        ? filename
        : "Mother-Resume.docx";

    return new NextResponse(docxBytes, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("DOCX generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate DOCX",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
