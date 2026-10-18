#!/usr/bin/env python3
"""
STAND-HF Electronic CRF & Dashboard Developer Data Specification
Refined 4-Page Executive PDF Generator using ReportLab
"""

import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and display 'Page X of Y'"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#1a5fb4"))

        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 810, "STAND-HF E-CRF & DASHBOARD")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(185, 810, "— Developer Data Specification & Integration Guide")
            self.drawRightString(595 - 36, 810, "Confidential · Study Protocol v1.0")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.6)
            self.line(36, 804, 595 - 36, 804)

        # Running Footer (all pages)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.6)
        self.line(36, 38, 595 - 36, 38)

        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#0f172a"))
        self.drawString(36, 26, "STAND-HF REGISTRY")
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(130, 26, "· Sponsor: Highnoon Laboratories Ltd. · Developer: Decoderium Technologies")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(595 - 36, 26, page_str)
        self.restoreState()


def build_pdf(filename="STAND-HF_Dashboard_Developer_Specification.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=46
    )

    printable_width = 595.27 - 72 # 523.27 pt

    # Brand Colors
    C_PRIMARY = colors.HexColor("#1a5fb4")
    C_SECONDARY = colors.HexColor("#0f172a")
    C_MUTED = colors.HexColor("#64748b")
    C_CARD_BG = colors.HexColor("#f8fafc")
    C_BORDER = colors.HexColor("#e2e8f0")
    C_WHITE = colors.white

    # Styles
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=C_PRIMARY,
        spaceAfter=2
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=C_MUTED,
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=C_PRIMARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=C_SECONDARY,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=C_SECONDARY,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=C_SECONDARY,
        leftIndent=10,
        firstLineIndent=-7,
        spaceAfter=2.5
    )

    code_style = ParagraphStyle(
        'DocCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor("#0f172a"),
        backColor=C_CARD_BG,
        borderColor=C_BORDER,
        borderWidth=0.5,
        borderPadding=4,
        spaceBefore=3,
        spaceAfter=5
    )

    callout_style = ParagraphStyle(
        'DocCallout',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1e3a8a"),
        backColor=colors.HexColor("#eff6ff"),
        borderColor=colors.HexColor("#bfdbfe"),
        borderWidth=0.5,
        borderPadding=5,
        spaceBefore=4,
        spaceAfter=6
    )

    th_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=C_WHITE
    )

    td_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=C_SECONDARY
    )

    td_code_style = ParagraphStyle(
        'TDCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.8,
        leading=8.8,
        textColor=colors.HexColor("#0969da")
    )

    story = []

    # =========================================================================
    # PAGE 1: TITLE, EXECUTIVE SUMMARY, FILE INVENTORY, QUICKSTART
    # =========================================================================

    # Header Banner
    meta_table_data = [
        [
            Paragraph("<b>STAND-HF ELECTRONIC CASE REPORT FORM & DASHBOARD</b><br/><font size=7.5 color='#64748b'>Clinical Cardiology Outpatient Heart Failure Registry · Pakistan Multi-Centre Study</font>", ParagraphStyle('HdrL', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, leading=12, textColor=C_PRIMARY)),
            Paragraph("<b>SPONSOR:</b> Highnoon Laboratories Ltd.<br/><b>DEVELOPER:</b> Decoderium Technologies<br/><b>DATE:</b> October 2026 · <b>VERSION:</b> 1.0 (Final)", ParagraphStyle('HdrR', parent=styles['Normal'], fontName='Helvetica', fontSize=7.2, leading=9.5, textColor=C_MUTED, alignment=2))
        ]
    ]
    t_meta = Table(meta_table_data, colWidths=[printable_width * 0.65, printable_width * 0.35])
    t_meta.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,0), (-1,-1), 1.2, C_PRIMARY),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Developer Data Specification & Integration Guide", title_style))
    story.append(Paragraph("Authoritative Data Architecture, Synthetic JSON Datasets, Clinical Invariants & KPI Computation Rules", subtitle_style))

    summary_text = (
        "<b>Executive Purpose & Scope:</b> This document provides the engineering handover specification for "
        "developers building or maintaining the <b>STAND-HF Clinical Dashboard</b> independently from the primary registry eCRF. "
        "It defines the canonical JSON data models, validation invariants, clinical lookups, and algorithmic formulas "
        "governing all dashboard telemetry (4/4 GDMT optimization, follow-up window adherence, and functional outcomes). "
        "The companion datasets in <code>srs/data/</code> provide full realistic test coverage with zero external backend dependencies."
    )
    story.append(Paragraph(summary_text, callout_style))
    story.append(Spacer(1, 4))

    # 1. Package Inventory
    story.append(Paragraph("1. Data Package Inventory & Architecture", h1_style))
    story.append(Paragraph("The dataset assets are organized under <code>srs/data/</code> in pure JSON and vanilla scripts:", body_style))

    inv_data = [
        [Paragraph("Asset Path", th_style), Paragraph("Type", th_style), Paragraph("Scope / Volume", th_style), Paragraph("Technical & Clinical Role", th_style)],
        [
            Paragraph("<code>srs/data/dummy_data.json</code>", td_code_style),
            Paragraph("JSON", td_style),
            Paragraph("<b>44 Patients</b><br/>132 Visit Slots", td_style),
            Paragraph("Master registry dataset matching browser <code>localStorage</code> (<code>standhf_ecrf_v1</code>). Contains patient records, visits (Baseline, 3M, 6M), Section B vitals, Section C GDMT pillars, Section D adverse events, audit history, and file attachments.", td_style)
        ],
        [
            Paragraph("<code>srs/data/access-control.json</code>", td_code_style),
            Paragraph("JSON", td_style),
            Paragraph("4 Users · 4 Sites<br/>3 Geo Zones", td_style),
            Paragraph("System RBAC model. Configures Super Admin, Central Team, Site Investigators, permitted hospital sites (RIC, LHR, KHI, ISB), and zones (North, Central, South).", td_style)
        ],
        [
            Paragraph("<code>srs/data/gdmt.json, clinical-options.json, location-and-title-standards.json</code>", td_code_style),
            Paragraph("JSON", td_style),
            Paragraph("Complete Master Lists", td_style),
            Paragraph("Clinical dropdown dictionaries: GDMT generic drugs, allowed strengths, default frequencies (OD, BD, TDS), NYHA classes, and non-initiation reasons.", td_style)
        ],
        [
            Paragraph("<code>srs/data/README.md</code>", td_code_style),
            Paragraph("Doc", td_style),
            Paragraph("Developer Manual", td_style),
            Paragraph("Full Markdown integration guide detailing TypeScript interfaces, API schemas, and calculation steps.", td_style)
        ]
    ]

    t_inv = Table(inv_data, colWidths=[125, 38, 75, printable_width - 238])
    t_inv.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_CARD_BG])
    ]))
    story.append(t_inv)
    story.append(Spacer(1, 6))

    # 2. Integration Quickstart
    story.append(Paragraph("2. Quickstart Integration Patterns", h1_style))
    p1 = "<b>• Frontend Frameworks (React, Vue, Vite, Next.js):</b> Import directly as a local JSON module: <code>import dataset from './data/dummy_data.json'; const patients = dataset.pts;</code>"
    p2 = "<b>• Mock REST API Server:</b> Launch via standard tooling: <code>npx -y json-server --watch srs/data/dummy_data.json --port 4000</code> to serve endpoints <code>GET /pts</code> and <code>GET /pts/:id</code>."
    p3 = "<b>• Browser LocalStorage Injection:</b> Run <code>localStorage.setItem('standhf_ecrf_v1', JSON.stringify(dataset));</code>. Both <code>dashboard/index.html</code> and <code>records/index.html</code> will immediately hydrate."
    story.append(Paragraph(p1, bullet_style))
    story.append(Paragraph(p2, bullet_style))
    story.append(Paragraph(p3, bullet_style))
    story.append(Spacer(1, 6))

    # 3. Access & Roles
    story.append(Paragraph("3. Access Control & Mandatory Site-Scoping Invariant", h1_style))
    p_roles = (
        "<b>Data Isolation Rule:</b> Users with role <code>investigator</code> (e.g. <code>emily.carter</code> at RIC/LHR or <code>adnan.khan</code> at KHI/ISB) "
        "<b>MUST NEVER</b> view, aggregate, or edit records outside their assigned site list (<code>mySites()</code>). "
        "Users with role <code>central</code> or <code>superadmin</code> possess global visibility across all 4 medical centres."
    )
    story.append(Paragraph(p_roles, callout_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: ENTITY SCHEMAS & VISIT FORMS (SECTIONS B, C, D)
    # =========================================================================

    story.append(Paragraph("4. Patient Entity & Demographics Schema", h1_style))
    story.append(Paragraph("Each patient object in the <code>pts</code> array represents an enrolled registry subject:", body_style))

    fields_data = [
        [Paragraph("Field Path", th_style), Paragraph("Type", th_style), Paragraph("Format / Allowed Values", th_style), Paragraph("Clinical Rule & Validation Behavior", th_style)],
        [Paragraph("<code>id</code>", td_code_style), Paragraph("string", td_style), Paragraph("<code>{SITE}-{001}</code>", td_style), Paragraph("Unique study identifier (e.g. <code>RIC-001</code>). Auto-sequenced by site.", td_style)],
        [Paragraph("<code>site</code>", td_code_style), Paragraph("string", td_style), Paragraph("RIC, LHR, KHI, ISB", td_style), Paragraph("Hospital code: Rawalpindi, Lahore, Karachi, or Islamabad.", td_style)],
        [Paragraph("<code>inv</code>", td_code_style), Paragraph("string", td_style), Paragraph("Full Name", td_style), Paragraph("Principal Investigator responsible for this subject.", td_style)],
        [Paragraph("<code>name</code>", td_code_style), Paragraph("string", td_style), Paragraph("2+ characters", td_style), Paragraph("Patient full name. Required for visit completion.", td_style)],
        [Paragraph("<code>contact</code>", td_code_style), Paragraph("string", td_style), Paragraph("<b>11 Digits</b> (0300...)", td_style), Paragraph("Primary phone number. Must match <code>/^\\d{11}$/</code>. Non-digits stripped.", td_style)],
        [Paragraph("<code>consent</code>", td_code_style), Paragraph("date", td_style), Paragraph("YYYY-MM-DD", td_style), Paragraph("Mandatory date. Cannot be in future. Baseline date defaults to this.", td_style)],
        [Paragraph("<code>age</code>", td_code_style), Paragraph("number", td_style), Paragraph("18 to 150 years", td_style), Paragraph("Inclusion requires age &ge; 18. Advisory banner triggered if 111–150.", td_style)],
        [Paragraph("<code>sex</code>", td_code_style), Paragraph("enum", td_style), Paragraph("'Male' | 'Female'", td_style), Paragraph("Patient biological sex.", td_style)],
        [Paragraph("<code>etio</code>", td_code_style), Paragraph("enum", td_style), Paragraph("'Ischemic' | 'Non-ischemic' | 'Other'", td_style), Paragraph("Heart failure primary etiology. If 'Other', <code>etioO</code> is mandatory.", td_style)],
        [Paragraph("<code>sync</code>", td_code_style), Paragraph("enum", td_style), Paragraph("'Synced' | 'Pending'", td_style), Paragraph("Local sync status with central server. Yellow badge when pending.", td_style)],
        [Paragraph("<code>v</code>", td_code_style), Paragraph("object", td_style), Paragraph("<code>{ b, m3, m6 }</code>", td_style), Paragraph("Visit dictionary: Baseline (b), 3 Months (m3), and 6 Months (m6).", td_style)]
    ]

    t_fields = Table(fields_data, colWidths=[90, 40, 115, printable_width - 245])
    t_fields.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_CARD_BG])
    ]))
    story.append(t_fields)
    story.append(Spacer(1, 6))

    story.append(Paragraph("5. Visit Sections B & C Specification", h1_style))
    story.append(Paragraph("Section B: Clinical & Functional Assessment (Single Unified Card)", h2_style))

    secb_data = [
        [Paragraph("Parameter", th_style), Paragraph("Key Path", th_style), Paragraph("Clinical Bounds", th_style), Paragraph("Validation Rules & Form Behavior", th_style)],
        [Paragraph("Weight", td_style), Paragraph("<code>v[k].wt</code>", td_code_style), Paragraph("30.0 – 250.0 kg", td_style), Paragraph("Decimal number (step 0.1). Required to lock visit.", td_style)],
        [Paragraph("Heart Rate", td_style), Paragraph("<code>v[k].hr</code>", td_code_style), Paragraph("30 – 220 bpm", td_style), Paragraph("Resting pulse rate. Soft warning triggered outside range.", td_style)],
        [Paragraph("Blood Pressure", td_style), Paragraph("<code>v[k].sbp, dbp</code>", td_code_style), Paragraph("SBP 50–260, DBP 30–160", td_style), Paragraph("<b>Hard error:</b> SBP must exceed DBP (<code>sbp &gt; dbp</code>).", td_style)],
        [Paragraph("NYHA Class", td_style), Paragraph("<code>v[k].nyha</code>", td_code_style), Paragraph("I, II, III, IV", td_style), Paragraph("Functional classification. Class IV triggers advisory check.", td_style)],
        [Paragraph("LVEF (%)", td_style), Paragraph("<code>v[k].lvef</code>", td_code_style), Paragraph("5 – 80% (Inclusion &le; 40%)", td_style), Paragraph("<b>Baseline & 6M ONLY. Strictly N/A at 3 Months.</b>", td_style)],
        [Paragraph("1MSTS Reps", td_style), Paragraph("<code>v[k].msts</code>", td_code_style), Paragraph("0 – 60 repetitions", td_style), Paragraph("1-Minute Sit-to-Stand functional capacity test.", td_style)],
        [Paragraph("Stop Reason", td_style), Paragraph("<code>v[k].stop</code>", td_code_style), Paragraph("Standard enum", td_style), Paragraph("Documented if 1MSTS stopped early (Dyspnea, Syncope, etc.).", td_style)]
    ]
    t_secb = Table(secb_data, colWidths=[80, 75, 110, printable_width - 265])
    t_secb.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_CARD_BG])
    ]))
    story.append(t_secb)
    story.append(Spacer(1, 4))

    story.append(Paragraph("Section C: Foundational GDMT (4 Pillars)", h2_style))
    story.append(Paragraph("Selecting a generic drug automatically marks Status as <code>'Active'</code>. Frequency and Strength dropdowns expand to full width on touch tablets.", body_style))

    gdmt_data = [
        [Paragraph("Pillar", th_style), Paragraph("Pharmacology", th_style), Paragraph("Approved Generics", th_style), Paragraph("Strengths & Recommended Dosing Frequencies", th_style)],
        [Paragraph("<code>arni</code>", td_code_style), Paragraph("ARNI", td_style), Paragraph("Sacubitril Valsartan", td_style), Paragraph("25mg, 50mg, 100mg, 200mg · <b>BD</b>", td_style)],
        [Paragraph("<code>bb</code>", td_code_style), Paragraph("Beta-blocker", td_style), Paragraph("Bisoprolol, Carvedilol, Nebivolol", td_style), Paragraph("Bisoprolol: 2.5, 5, 10mg (OD) · Carvedilol: 3.125, 6.25, 12.5, 25mg (BD) · Nebivolol: 1.5, 2.5, 5, 10mg (OD)", td_style)],
        [Paragraph("<code>mra</code>", td_code_style), Paragraph("MRA", td_style), Paragraph("Spironolactone, Eplerenone, Finerenone", td_style), Paragraph("Spironolactone: 12.5, 25, 50mg (OD) · Eplerenone: 25, 50mg (OD) · Finerenone: 10, 20, 40mg (OD)", td_style)],
        [Paragraph("<code>sg</code>", td_code_style), Paragraph("SGLT2 inhibitor", td_style), Paragraph("Dapagliflozin, Empagliflozin, Sotagliflozin", td_style), Paragraph("Dapagliflozin / Empagliflozin: 10mg (OD) · Sotagliflozin: 200, 400mg (OD)", td_style)]
    ]
    t_gdmt = Table(gdmt_data, colWidths=[40, 75, 125, printable_width - 240])
    t_gdmt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_CARD_BG])
    ]))
    story.append(t_gdmt)
    story.append(Spacer(1, 4))

    p_reasons = (
        "<b>Non-Initiation Reasons (<code>v[k].rs</code>):</b> If any pillar is 'Not started' or 'Stopped', at least one reason must be flagged: "
        "<code>hypo</code> (Hypotension), <code>brady</code> (Bradycardia), <code>renal</code> (Renal dysfunction), <code>k</code> (Hyperkalemia), "
        "<code>intol</code> (Intolerance), <code>cost</code> (Cost barrier), <code>pref</code> (Patient preference), or <code>phys</code> (Physician decision), plus free-text <code>rsO</code>.<br/>"
        "<b>Section D (Events <code>v[k].ev</code>):</b> Tracks <code>ev.hf</code> (HF hospitalization), <code>ev.all</code> (All-cause hospitalization), "
        "<code>ev.death</code> (Death at 3M/6M), and <code>ev.int</code> (Major intervention description)."
    )
    story.append(Paragraph(p_reasons, callout_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: DASHBOARD METRICS & KPI COMPUTATION ALGORITHMS
    # =========================================================================

    story.append(Paragraph("6. Dashboard KPI & Metric Calculation Algorithms", h1_style))
    story.append(Paragraph("Dashboard developers must implement these standardized calculation functions to ensure consistency across views:", body_style))

    kpi1 = """<b>Algorithm 1: Quadruple GDMT Optimization Rate (Protocol Target: &ge; 70%)</b><br/>
<font color='#0969da'>function act(v) { return ['arni','bb','mra','sg'].filter(q =&gt; v.g?.[q]?.status === 'Active').length; }</font><br/>
• For each patient, identify their <b>most recent completed visit</b> (<code>last = ['m6','m3','b'].find(k =&gt; p.v[k]?.done)</code>).<br/>
• Evaluate <code>act(p.v[last])</code>. Quadruple therapy requires all 4 pillars to be <code>'Active'</code>.<br/>
• <b>Dashboard KPI Formula:</b> <code>Rate (%) = (Count of patients with 4 active pillars / Total patients with &ge;1 visit done) &times; 100</code>"""
    story.append(Paragraph(kpi1, callout_style))
    story.append(Spacer(1, 4))

    kpi2 = """<b>Algorithm 2: Follow-Up Protocol Window Adherence (On-Time Follow-up Rate)</b><br/>
Evaluates whether completed follow-up visits occurred within protocol target windows:<br/>
• <b>Month 3 (m3):</b> Target day 90 &plusmn; 14 days (Window: Day 76 to Day 104 from Baseline date).<br/>
• <b>Month 6 (m6):</b> Target day 180 &plusmn; 21 days (Window: Day 159 to Day 201 from Baseline date).<br/>
<font color='#0969da'>function onTime(p, k) { const d = Math.round((day(p.v[k].date) - day(p.v.b.date)) / 864e5); return Math.abs(d - (k==='m3'?90:180)) &le; (k==='m3'?14:21); }</font><br/>
• <b>Adherence KPI Formula:</b> <code>OnTimeRate (%) = (Total on-time visits / Total completed follow-up visits) &times; 100</code>"""
    story.append(Paragraph(kpi2, callout_style))
    story.append(Spacer(1, 4))

    kpi3 = """<b>Algorithm 3: Primary Functional & Echocardiographic Endpoints (&Delta; Baseline &rarr; 6 Months)</b><br/>
Evaluated exclusively across the cohort of patients having completed both Baseline and Month 6 visits:<br/>
• <b>Mean &Delta; 1MSTS Capacity:</b> <code>MeanDeltaMSTS = &Sigma; (p.v.m6.msts - p.v.b.msts) / Count(completed_cohort)</code> (Repetitions in 60s).<br/>
• <b>Mean &Delta; LVEF Remodeling:</b> <code>MeanDeltaLVEF = &Sigma; (p.v.m6.lvef - p.v.b.lvef) / Count(completed_cohort)</code> (Absolute percentage points)."""
    story.append(Paragraph(kpi3, callout_style))
    story.append(Spacer(1, 4))

    kpi4 = """<b>Algorithm 4: Visit Status Classification State Machine (<code>vstat</code>)</b><br/>
Drives follow-up queues, upcoming visit calendars, and status pill badges:<br/>
1. <b>'Completed':</b> <code>v.done === true</code><br/>
2. <b>'Missed':</b> Today &gt; BaselineDate + TargetDays + WindowTolerance + 30 days, AND no data has been entered.<br/>
3. <b>'Overdue':</b> Today &gt; BaselineDate + TargetDays + WindowTolerance, AND visit not completed.<br/>
4. <b>'Due':</b> Today &ge; BaselineDate + TargetDays - WindowTolerance, AND visit not completed.<br/>
5. <b>'In Progress':</b> Visit uncompleted but draft data exists (vitals, drugs, or attached file).<br/>
6. <b>'Not Started':</b> Visit window has not yet opened."""
    story.append(Paragraph(kpi4, callout_style))
    story.append(Spacer(1, 4))

    kpi5 = """<b>Algorithm 5: Adverse Clinical Event Telemetry (Section D Aggregations)</b><br/>
Counts cumulative adverse outcomes reported across follow-up visits (3M and 6M):<br/>
• <b>HF Hospitalizations:</b> <code>pts.filter(p =&gt; ['m3','m6'].some(k =&gt; p.v[k]?.ev?.hf)).length</code><br/>
• <b>All-Cause Hospitalizations:</b> <code>pts.filter(p =&gt; ['m3','m6'].some(k =&gt; p.v[k]?.ev?.all)).length</code><br/>
• <b>Deaths Recorded:</b> <code>pts.filter(p =&gt; ['m3','m6'].some(k =&gt; p.v[k]?.ev?.death)).length</code>"""
    story.append(Paragraph(kpi5, callout_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: DATASET VERIFICATION SUMMARY & CONCRETE SAMPLE PAYLOAD
    # =========================================================================

    story.append(Paragraph("7. Dummy Dataset Telemetry & Test Coverage", h1_style))
    story.append(Paragraph("The dataset in <code>srs/data/dummy_data.json</code> contains 44 realistic records verifying all dashboard states:", body_style))

    stat_data = [
        [Paragraph("Metric / Indicator", th_style), Paragraph("Dataset Result", th_style), Paragraph("Protocol Target", th_style), Paragraph("Dashboard Component Tested", th_style)],
        [Paragraph("Enrolled Patient Roster", td_style), Paragraph("<b>44 Patients</b>", td_style), Paragraph("40–50 Subjects", td_style), Paragraph("Roster table, patient search, and site distribution.", td_style)],
        [Paragraph("Site Allocation", td_style), Paragraph("11 RIC · 11 LHR · 11 KHI · 11 ISB", td_style), Paragraph("Balanced 4 centres", td_style), Paragraph("Site league table, zone filter, and investigator scoping.", td_style)],
        [Paragraph("Baseline Completed", td_style), Paragraph("44 of 44 (100%)", td_style), Paragraph("100% enrolled", td_style), Paragraph("Enrolment KPI counter and recruitment trajectory.", td_style)],
        [Paragraph("3 Months Completed", td_style), Paragraph("28 of 44 (63.6%)", td_style), Paragraph("Longitudinal follow-up", td_style), Paragraph("3M Milestone completion counter and Phase Dial.", td_style)],
        [Paragraph("6 Months Completed", td_style), Paragraph("16 of 44 (36.4%)", td_style), Paragraph("Full study completion", td_style), Paragraph("6M Milestone completion counter and Phase Dial.", td_style)],
        [Paragraph("Protocol Window Adherence", td_style), Paragraph("<b>100% On-Time</b>", td_style), Paragraph("&ge; 80% Adherence", td_style), Paragraph("Clinical performance on-time KPI widget.", td_style)],
        [Paragraph("Quadruple GDMT Coverage", td_style), Paragraph("<b>75%</b> (33 of 44 patients)", td_style), Paragraph("&ge; 70% Target", td_style), Paragraph("GDMT coverage bar chart, pill tiles, and donut.", td_style)],
        [Paragraph("Mean &Delta; 1MSTS Outcome", td_style), Paragraph("<b>+10.5 repetitions</b>", td_style), Paragraph("Functional gain &gt; 0", td_style), Paragraph("Functional outcome card (&Delta; 1MSTS baseline &rarr; 6M).", td_style)],
        [Paragraph("Mean &Delta; LVEF Remodeling", td_style), Paragraph("<b>+9.9 percentage points</b>", td_style), Paragraph("Echocardiographic gain", td_style), Paragraph("Echocardiographic remodeling card (&Delta; LVEF).", td_style)],
        [Paragraph("Follow-Up Action Queue", td_style), Paragraph("3 Overdue · 7 Due", td_style), Paragraph("Queue active &gt; 0", td_style), Paragraph("Tests urgent follow-up queue and overdue alert badges.", td_style)],
        [Paragraph("Adverse Clinical Events", td_style), Paragraph("3 HF Hosp · 1 Death at M6", td_style), Paragraph("Safety reporting", td_style), Paragraph("Adverse clinical event telemetry tiles.", td_style)]
    ]

    t_stat = Table(stat_data, colWidths=[105, 100, 95, printable_width - 300])
    t_stat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_CARD_BG])
    ]))
    story.append(t_stat)
    story.append(Spacer(1, 6))

    story.append(Paragraph("8. Sample Patient Record Snippet (JSON)", h1_style))

    sample_json = """{
  "id": "RIC-001", "site": "RIC", "inv": "Emily Carter", "owner": "emily.carter",
  "name": "Ali Raza", "contact": "03005550100", "consent": "2026-04-06", "age": 38, "sex": "Male", "etio": "Ischemic",
  "sync": "Synced", "files": { "b": [{"id": "f_ric001_b", "name": "prescription-RIC-001-b.png", "type": "image/png"}] },
  "v": {
    "b": {
      "date": "2026-04-06", "done": true, "wt": 65.0, "hr": 76, "sbp": 112, "dbp": 70, "nyha": "II", "lvef": 22, "msts": 8, "stop": "",
      "g": {
        "arni": { "drug": "Sacubitril Valsartan", "strength": "50mg", "freq": "BD", "status": "Active" },
        "bb":   { "drug": "Bisoprolol fumarate", "strength": "2.5mg", "freq": "OD", "status": "Active" },
        "mra":  { "drug": "Spironolactone", "strength": "25mg", "freq": "OD", "status": "Active" },
        "sg":   { "drug": "Dapagliflozin", "strength": "10mg", "freq": "OD", "status": "Active" }
      },
      "ev": { "hf": false, "all": false, "int": "Coronary Angiography" }, "ini": "EC"
    },
    "m3": { "date": "2026-07-03", "done": true, "wt": 63.5, "hr": 72, "sbp": 110, "dbp": 69, "nyha": "I", "msts": 12, ... },
    "m6": { "date": "2026-09-30", "done": true, "wt": 62.5, "hr": 68, "sbp": 108, "dbp": 68, "nyha": "I", "lvef": 30, "msts": 17, ... }
  }
}"""
    story.append(Paragraph(sample_json.replace(" ", "&nbsp;").replace("\n", "<br/>"), code_style))
    story.append(Spacer(1, 4))

    # Signoff Box
    signoff_data = [
        [
            Paragraph("<b>CERTIFICATION & DEVELOPER RELEASE:</b><br/>This document and accompanying datasets in <code>srs/data/</code> are validated for dashboard independent development.", ParagraphStyle('S1', parent=styles['Normal'], fontName='Helvetica', fontSize=7.2, leading=9.5, textColor=C_MUTED)),
            Paragraph("<b>STATUS:</b> Approved Technical Release<br/><b>BUILD:</b> STAND-HF Portal v1.0", ParagraphStyle('S2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.5, leading=9.5, textColor=C_PRIMARY, alignment=2))
        ]
    ]
    t_signoff = Table(signoff_data, colWidths=[printable_width * 0.7, printable_width * 0.3])
    t_signoff.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,-1), 0.6, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4)
    ]))
    story.append(t_signoff)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Refined 4-page PDF successfully built: {filename}")


if __name__ == '__main__':
    out_dir = os.path.dirname(os.path.abspath(__file__))
    out_pdf = os.path.join(out_dir, "STAND-HF_Dashboard_Developer_Specification.pdf")
    build_pdf(out_pdf)
