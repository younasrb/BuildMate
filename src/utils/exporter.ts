import { PDFData, PresentationData } from '../types';
import pptxgen from 'pptxgenjs';

/**
 * Downloads presentation data as a real native PowerPoint (.pptx) file directly
 * with custom Theme color choices (dark, light, navy, emerald, sunset)
 */
export async function downloadNativePPTX(
  data: PresentationData,
  themeStyle: 'dark' | 'light' | 'navy' | 'emerald' | 'sunset' = 'dark'
) {
  const pTitle = data.presentationTitle || 'Presentation';
  const fileName = pTitle.replace(/[^a-zA-Z0-9]/g, '_');

  const THEMES = {
    dark: { bg: '0F172A', accent: '6366F1', titleColor: 'FFFFFF', textColor: 'E2E8F0', badgeColor: '818CF8' },
    light: { bg: 'FFFFFF', accent: '2563EB', titleColor: '0F172A', textColor: '334155', badgeColor: '2563EB' },
    navy: { bg: '0A2540', accent: 'F59E0B', titleColor: 'FFFFFF', textColor: 'CBD5E1', badgeColor: 'F59E0B' },
    emerald: { bg: '064E3B', accent: '10B981', titleColor: 'FFFFFF', textColor: 'E2E8F0', badgeColor: '34D399' },
    sunset: { bg: '431407', accent: 'F97316', titleColor: 'FFFFFF', textColor: 'FFEDD5', badgeColor: 'FB923C' },
  };

  const theme = THEMES[themeStyle] || THEMES.dark;

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = pTitle;
  pptx.author = 'BuildMate AI - BUET Khuzdar';

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: theme.bg };
  
  // Top Accent Bar (Numeric width in inches for 16x9: 13.33)
  titleSlide.addShape('rect', {
    x: 0, y: 0, w: 13.33, h: 0.2, fill: { color: theme.accent }
  });

  // Title text
  titleSlide.addText(pTitle, {
    x: 0.8, y: 2.0, w: 11.7, h: 1.8,
    fontSize: 32, bold: true, color: theme.titleColor,
    align: 'center'
  });

  // Subtitle / Author
  titleSlide.addText('Generated with BuildMate AI • ACT AI Course (BUET Khuzdar)', {
    x: 0.8, y: 4.0, w: 11.7, h: 0.8,
    fontSize: 15, color: theme.badgeColor,
    align: 'center'
  });

  // Content Slides
  data.slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: theme.bg };

    // Top Accent Bar
    slide.addShape('rect', {
      x: 0, y: 0, w: 13.33, h: 0.15, fill: { color: theme.accent }
    });

    // Badge Slide number
    slide.addText(`SLIDE ${idx + 1} / ${data.slides.length}`, {
      x: 9.8, y: 0.3, w: 2.8, h: 0.4,
      fontSize: 11, bold: true, color: theme.badgeColor,
      align: 'right'
    });

    // Slide Title
    slide.addText(s.title || `Slide ${idx + 1}`, {
      x: 0.8, y: 0.4, w: 9.0, h: 0.9,
      fontSize: 24, bold: true, color: theme.titleColor
    });

    // Bullet Points
    if (s.bulletPoints && s.bulletPoints.length > 0) {
      const formattedBullets = s.bulletPoints.map(bp => ({
        text: bp,
        options: { fontSize: 16, color: theme.textColor, bullet: true, spaceAfter: 10 }
      }));

      slide.addText(formattedBullets, {
        x: 0.8, y: 1.5, w: 11.7, h: 5.0,
        valign: 'top'
      });
    }

    // Speaker notes
    if (s.speakerNotes) {
      slide.addNotes(s.speakerNotes);
    }
  });

  // Save and download PowerPoint file directly (.pptx)
  await pptx.writeFile({ fileName: `${fileName}_Deck.pptx` });
}

/**
 * Downloads document data as a Word / Google Docs compatible file (.doc)
 */
export function downloadWordDocument(data: PDFData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${data.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
        h1 { color: #4338ca; font-size: 26px; margin-bottom: 4px; }
        .subtitle { color: #64748b; font-size: 14px; margin-bottom: 12px; }
        .meta { color: #4f46e5; font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px; }
        .summary-box { background-color: #f1f5f9; border-left: 4px solid #4338ca; padding: 16px; margin-bottom: 24px; border-radius: 4px; }
        .summary-title { font-weight: bold; color: #4338ca; font-size: 12px; text-transform: uppercase; margin-bottom: 6px; }
        h2 { color: #3730a3; font-size: 18px; margin-top: 24px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
        p { font-size: 13px; color: #334155; }
        ul { margin-top: 6px; margin-bottom: 16px; }
        li { font-size: 13px; color: #475569; margin-bottom: 4px; }
        .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; }
      </style>
    </head>
    <body>
      <h1>${data.title}</h1>
      ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
      <div class="meta">By: ${data.author} | Date: ${data.date}</div>

      ${data.summary ? `
        <div class="summary-box">
          <div class="summary-title">Executive Summary</div>
          <div>${data.summary}</div>
        </div>
      ` : ''}

      ${data.sections ? data.sections.map(sec => `
        <h2>${sec.heading}</h2>
        <p>${sec.content}</p>
        ${sec.bulletPoints && sec.bulletPoints.length > 0 ? `
          <ul>
            ${sec.bulletPoints.map(bp => `<li>${bp}</li>`).join('')}
          </ul>
        ` : ''}
      `).join('') : ''}

      <div class="footer">Generated by BuildMate AI Studio • ACT AI Course Batch 2</div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}_Document.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads presentation data as a Google Slides / PowerPoint HTML Presentation (.html / .ppt)
 */
export function downloadPresentationDeck(data: PresentationData) {
  const pTitle = data.presentationTitle || 'Presentation';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${pTitle}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px; }
        .slide { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border: 2px solid #6366f1; border-radius: 20px; padding: 40px; margin-bottom: 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); min-height: 400px; display: flex; flex-col; justify-content: space-between; position: relative; }
        .slide-num { position: absolute; top: 20px; right: 25px; background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; border: 1px solid rgba(99, 102, 241, 0.4); }
        h1 { color: #ffffff; font-size: 28px; margin-top: 0; margin-bottom: 24px; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
        ul { font-size: 18px; line-height: 1.8; color: #e2e8f0; margin-bottom: 30px; }
        li { margin-bottom: 10px; }
        .notes { background: rgba(15, 23, 42, 0.9); border: 1px border-indigo-500/40; border-radius: 10px; padding: 15px; margin-top: 20px; font-size: 13px; color: #94a3b8; font-style: italic; }
        .notes-title { color: #f97316; font-weight: bold; text-transform: uppercase; font-size: 11px; margin-bottom: 4px; font-style: normal; }
        .header { text-align: center; margin-bottom: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="border:none; text-align:center; font-size:36px; color:#818cf8;">${pTitle}</h1>
        <p style="color:#94a3b8;">Created with BuildMate AI • Google Slides & PowerPoint Compatible Deck</p>
      </div>

      ${data.slides.map(s => `
        <div class="slide">
          <div class="slide-num">Slide ${s.slideNumber} of ${data.slides.length}</div>
          <div>
            <h1>${s.title}</h1>
            <ul>
              ${s.bulletPoints.map(bp => `<li>${bp}</li>`).join('')}
            </ul>
          </div>
          ${s.speakerNotes ? `
            <div class="notes">
              <div class="notes-title">🎤 Speaker Notes (Google Slides)</div>
              ${s.speakerNotes}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/vnd.ms-powerpoint;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${pTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Presentation.ppt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads Python script (using python-pptx) to programmatically generate and design PowerPoint PPTX slides
 */
export function downloadPythonPPTXScript(data: PresentationData) {
  const pTitle = data.presentationTitle || 'Presentation';
  const fileName = pTitle.replace(/[^a-zA-Z0-9]/g, '_');

  const pythonScript = `"""
====================================================================
 BuildMate AI - Python PowerPoint Generator (python-pptx)
 Title: ${pTitle}
 Requirements: pip install python-pptx
====================================================================
"""

import sys
try:
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN
    from pptx.enum.shapes import MSO_SHAPE
except ImportError:
    print("Error: 'python-pptx' library is missing.")
    print("Please install it using: pip install python-pptx")
    sys.exit(1)

def create_presentation():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_slide_layout = prs.slide_layouts[6]  # Blank layout

    slides_data = ${JSON.stringify(data.slides, null, 4)}

    print(f"Generating PPTX for '${pTitle}' ({len(slides_data)} slides)...")

    for index, slide_data in enumerate(slides_data, start=1):
        slide = prs.slides.add_slide(blank_slide_layout)

        # Background Rectangle (Dark Navy Theme)
        bg = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5)
        )
        bg.fill.solid()
        bg.fill.fore_color.rgb = RGBColor(15, 23, 42)  # slate-900
        bg.line.fill.background()

        # Accent Top Bar
        top_bar = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.15)
        )
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = RGBColor(99, 102, 241)  # indigo-500
        top_bar.line.fill.background()

        # Slide Number Badge
        badge = slide.shapes.add_textbox(Inches(11.5), Inches(0.4), Inches(1.4), Inches(0.4))
        tf_badge = badge.text_frame
        p_badge = tf_badge.paragraphs[0]
        p_badge.text = f"SLIDE {index}/{len(slides_data)}"
        p_badge.font.size = Pt(11)
        p_badge.font.bold = True
        p_badge.font.color.rgb = RGBColor(129, 140, 248)

        # Title Box
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(10.5), Inches(1.2))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = slide_data.get('title', '')
        p_title.font.size = Pt(28)
        p_title.font.bold = True
        p_title.font.color.rgb = RGBColor(255, 255, 255)

        # Content Box (Bullet Points)
        content_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.9), Inches(11.7), Inches(4.5))
        tf_content = content_box.text_frame
        tf_content.word_wrap = True

        bullet_points = slide_data.get('bulletPoints', [])
        for i, point in enumerate(bullet_points):
            p = tf_content.add_paragraph() if i > 0 else tf_content.paragraphs[0]
            p.text = f"•  {point}"
            p.font.size = Pt(18)
            p.font.color.rgb = RGBColor(226, 232, 240)  # slate-200
            p.space_after = Pt(14)

        # Speaker Notes
        speaker_notes = slide_data.get('speakerNotes', '')
        if speaker_notes:
            notes_slide = slide.notes_slide
            text_frame = notes_slide.notes_text_frame
            text_frame.text = speaker_notes

    output_filename = "${fileName}_Deck.pptx"
    prs.save(output_filename)
    print(f"SUCCESS! Presentation saved successfully as '{output_filename}'")

if __name__ == "__main__":
    create_presentation()
`;

  const blob = new Blob([pythonScript], { type: 'text/x-python;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `generate_${fileName}_slides.py`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads Java source code file (Apache POI) to programmatically generate PowerPoint PPTX slides
 */
export function downloadJavaPOIScript(data: PresentationData) {
  const pTitle = data.presentationTitle || 'Presentation';
  const fileName = pTitle.replace(/[^a-zA-Z0-9]/g, '_');
  const className = `Generate${fileName.replace(/[^a-zA-Z0-9]/g, '')}Slides`;

  const javaScript = `/*
====================================================================
 BuildMate AI - Java PowerPoint Generator (Apache POI)
 Title: ${pTitle}
 Dependency: org.apache.poi:poi-ooxml:5.2.3
====================================================================
*/

import java.io.FileOutputStream;
import java.io.IOException;
import java.awt.Color;
import java.awt.Rectangle;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;
import org.apache.poi.xslf.usermodel.XSLFAutoShape;
import org.apache.poi.sl.usermodel.ShapeType;

public class ${className} {

    public static void main(String[] args) {
        System.out.println("Generating Java PowerPoint presentation: ${pTitle}...");

        try (XMLSlideShow ppt = new XMLSlideShow()) {
            ppt.setPageSize(new java.awt.Dimension(960, 540)); // 16:9 aspect ratio

            // Slide Data Definitions
            String presentationTitle = "${pTitle.replace(/"/g, '\\"').replace(/\n/g, ' ')}";

            ${data.slides.map((s, idx) => `
            // ================= SLIDE ${idx + 1} =================
            {
                XSLFSlide slide = ppt.createSlide();

                // Dark background
                XSLFAutoShape bg = slide.createAutoShape();
                bg.setShapeType(ShapeType.RECT);
                bg.setAnchor(new Rectangle(0, 0, 960, 540));
                bg.setFillColor(new Color(15, 23, 42)); // Slate-900

                // Header Title
                XSLFTextBox titleBox = slide.createTextBox();
                titleBox.setAnchor(new Rectangle(50, 40, 860, 60));
                XSLFTextParagraph titlePara = titleBox.addNewTextParagraph();
                XSLFTextRun titleRun = titlePara.addNewTextRun();
                titleRun.setText("${s.title.replace(/"/g, '\\"').replace(/\n/g, ' ')}");
                titleRun.setFontSize(24.0);
                titleRun.setBold(true);
                titleRun.setFontColor(new Color(255, 255, 255));

                // Bullet Points
                XSLFTextBox contentBox = slide.createTextBox();
                contentBox.setAnchor(new Rectangle(50, 120, 860, 360));
                ${s.bulletPoints.map((bp, bpIdx) => `
                {
                    XSLFTextParagraph p = contentBox.addNewTextParagraph();
                    p.setBullet(true);
                    XSLFTextRun r = p.addNewTextRun();
                    r.setText("${bp.replace(/"/g, '\\"').replace(/\n/g, ' ')}");
                    r.setFontSize(16.0);
                    r.setFontColor(new Color(226, 232, 240));
                }`).join('\n')}
            }
            `).join('\n')}

            String outputFile = "${fileName}_Presentation.pptx";
            try (FileOutputStream out = new FileOutputStream(outputFile)) {
                ppt.write(out);
                System.out.println("SUCCESS! Saved presentation to: " + outputFile);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
`;

  const blob = new Blob([javaScript], { type: 'text/x-java-source;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${className}.java`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

