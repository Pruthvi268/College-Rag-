import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors

os.makedirs("sample_data", exist_ok=True)
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "DocTitle",
    parent=styles["Heading1"],
    fontSize=18,
    leading=22,
    textColor=colors.HexColor("#1e3a8a"),
    spaceAfter=12,
)

h2_style = ParagraphStyle(
    "DocH2",
    parent=styles["Heading2"],
    fontSize=13,
    leading=16,
    textColor=colors.HexColor("#1d4ed8"),
    spaceBefore=10,
    spaceAfter=6,
)

body_style = ParagraphStyle(
    "DocBody",
    parent=styles["Normal"],
    fontSize=10,
    leading=14,
    spaceAfter=6,
)


def create_mca_doc():
    filename = "sample_data/MCA_Admission_Guidelines_2026.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    story = []

    story.append(Paragraph("EXCELSIOR INSTITUTE OF TECHNOLOGY & SCIENCE", title_style))
    story.append(Paragraph("Department of Computer Applications — MCA Admissions 2026-27", h2_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>1. Program Overview</b>", h2_style))
    story.append(Paragraph(
        "The Master of Computer Applications (MCA) is a 2-year full-time postgraduate program accredited by AICTE and affiliated with State Technical University. "
        "The program prepares candidates for careers in software engineering, AI/ML, cloud computing, and enterprise application development.",
        body_style
    ))

    story.append(Paragraph("<b>2. Eligibility Criteria</b>", h2_style))
    story.append(Paragraph(
        "• Passed BCA / Bachelor Degree in Computer Science Engineering or equivalent degree OR passed B.Sc. / B.Com. / B.A. with Mathematics at 10+2 level or at Graduation level.<br/>"
        "• Obtained at least <b>50% marks</b> (45% in case of candidates belonging to reserved categories SC/ST/OBC) in the qualifying examination.<br/>"
        "• Candidates appearing in the final semester examinations are also eligible to apply provisionally.",
        body_style
    ))

    story.append(Paragraph("<b>3. Entrance Examination & Selection Process</b>", h2_style))
    story.append(Paragraph(
        "Admissions are strictly merit-based determined by the College Entrance Test (CET-2026) or State PGCET/NIMCET scores. "
        "Shortlisted candidates will be invited for counseling and document verification.",
        body_style
    ))

    story.append(PageBreak())

    story.append(Paragraph("<b>4. Seat Matrix & Quota Allocation</b>", h2_style))
    table_data = [
        ["Quota Category", "Percentage", "Total Seats"],
        ["State Government / Merit Quota", "50%", "60 Seats"],
        ["Management / Institutional Quota", "35%", "42 Seats"],
        ["NRI / Foreign Nationals / Sponsored", "15%", "18 Seats"],
        ["Total Intake", "100%", "120 Seats"],
    ]
    t = Table(table_data, colWidths=[200, 100, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2563eb")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>5. Fee Structure & Important Dates</b>", h2_style))
    story.append(Paragraph(
        "• Annual Tuition Fee: <b>₹1,20,000</b> per year.<br/>"
        "• University Registration & Exam Fee: <b>₹6,500</b> per year.<br/>"
        "• Application Registration Fee: <b>₹1,500</b> (Non-refundable).<br/>"
        "• Online Application Portal Opening: <b>May 10, 2026</b>.<br/>"
        "• Last Date for Submission: <b>June 25, 2026</b>.<br/>"
        "• CET-2026 Entrance Examination: <b>July 12, 2026</b>.<br/>"
        "• Commencement of First Semester Classes: <b>August 10, 2026</b>.",
        body_style
    ))

    doc.build(story)


def create_hostel_doc():
    filename = "sample_data/Hostel_Fee_Structure_2026.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    story = []

    story.append(Paragraph("EXCELSIOR CAMPUS HOSTEL ADMINISTRATION", title_style))
    story.append(Paragraph("Hostel Accommodation Guidelines & Fee Schedule 2026-27", h2_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>1. Room Types and Annual Rent</b>", h2_style))
    table_data = [
        ["Room Category", "Occupancy", "Annual Rent (INR)"],
        ["Standard Non-AC", "3-Sharing", "₹65,000"],
        ["Deluxe Non-AC", "2-Sharing", "₹85,000"],
        ["Executive AC", "2-Sharing", "₹1,15,000"],
        ["Premium Single AC", "1-Sharing", "₹1,50,000"],
    ]
    t = Table(table_data, colWidths=[180, 120, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0d9488")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>2. Mess and Food Charges</b>", h2_style))
    story.append(Paragraph(
        "Annual Mess Charges are <b>₹42,000</b> per student. Includes unlimited breakfast, lunch, evening snacks/tea, and dinner. "
        "Both North Indian and South Indian vegetarian and non-vegetarian menus are provided on alternate days.",
        body_style
    ))

    story.append(Paragraph("<b>3. Caution Deposit & Electricity</b>", h2_style))
    story.append(Paragraph(
        "• Refundable Security Caution Deposit: <b>₹10,000</b> (refundable upon vacating).<br/>"
        "• Electricity charges for AC rooms: 100 units/month free; excess units charged at ₹8.50 per unit.",
        body_style
    ))

    story.append(Paragraph("<b>4. Hostel Rules, Curfew & Key Officials</b>", h2_style))
    story.append(Paragraph(
        "• Curfew Timings: Campus main gate closes at <b>9:30 PM</b> on weekdays and <b>10:00 PM</b> on Saturdays/Sundays.<br/>"
        "• Night Out Pass: Must be submitted on the student ERP portal 24 hours in advance with parent OTP confirmation.<br/>"
        "• Chief Warden (Boys Hostel Block A & B): Prof. R. K. Verma (Contact: 080-23456781, warden.boys@college.edu).<br/>"
        "• Chief Warden (Girls Hostel Block C & D): Dr. Meera Nair (Contact: 080-23456782, warden.girls@college.edu).",
        body_style
    ))

    doc.build(story)


def create_calendar_doc():
    filename = "sample_data/Academic_Calendar_2026_27.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    story = []

    story.append(Paragraph("OFFICE OF THE CONTROLLER OF EXAMINATIONS", title_style))
    story.append(Paragraph("Official Academic Calendar — Academic Year 2026-27", h2_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Odd Semester (Autumn 2026) Schedule</b>", h2_style))
    table_data = [
        ["Event Description", "Start Date", "End Date"],
        ["Commencement of Classes (All UG/PG)", "August 10, 2026", "-"],
        ["Internal Assessment 1 (IA-1)", "October 5, 2026", "October 10, 2026"],
        ["Mid-Semester Dussehra Break", "October 26, 2026", "November 1, 2026"],
        ["Internal Assessment 2 (IA-2)", "December 7, 2026", "December 12, 2026"],
        ["Last Working Day of Semester", "December 24, 2026", "-"],
        ["Practical Examinations", "January 4, 2027", "January 15, 2027"],
        ["Semester End Theory Examinations", "January 18, 2027", "February 6, 2027"],
        ["Commencement of Even Semester", "February 22, 2027", "-"],
    ]
    t = Table(table_data, colWidths=[200, 120, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#7c3aed")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Academic Regulations Note</b>", h2_style))
    story.append(Paragraph(
        "A minimum of 90 instruction days per semester is mandatory. Any lost hours due to unforeseen holidays shall be compensated on designated working Saturdays.",
        body_style
    ))

    doc.build(story)


def create_exam_regulations_doc():
    filename = "sample_data/Examination_Regulations_and_Grading_2026.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    story = []

    story.append(Paragraph("ACADEMIC COUNCIL NOTIFICATION 2026", title_style))
    story.append(Paragraph("Examination Guidelines, 75% Attendance & 10-Point Grading System", h2_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>1. Mandatory Attendance Regulation (Regulation 12)</b>", h2_style))
    story.append(Paragraph(
        "• Every student must secure a minimum of <b>75% attendance</b> in each registered theory and laboratory course to be eligible to appear for Semester End Examinations (SEE).<br/>"
        "• Condonation of attendance shortage between <b>65% and 74%</b> may be granted exclusively on genuine medical grounds by the Principal upon payment of a condonation fee of <b>₹1,000 per subject</b>.<br/>"
        "• Students having attendance below 65% under any circumstances shall be awarded 'Not Satisfied' (Grade NS) and must repeat the course.",
        body_style
    ))

    story.append(Paragraph("<b>2. 10-Point Grading Scale</b>", h2_style))
    table_data = [
        ["Letter Grade", "Marks Range", "Grade Points", "Performance"],
        ["O", "90 - 100%", "10", "Outstanding"],
        ["A+", "80 - 89%", "9", "Excellent"],
        ["A", "70 - 79%", "8", "Very Good"],
        ["B+", "60 - 69%", "7", "Good"],
        ["B", "55 - 59%", "6", "Above Average"],
        ["C", "50 - 54%", "5", "Average / Pass"],
        ["F", "< 50%", "0", "Fail (Must Re-appear)"],
    ]
    t = Table(table_data, colWidths=[100, 100, 100, 140])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#dc2626")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>3. Revaluation & Examination Fees</b>", h2_style))
    story.append(Paragraph(
        "• Regular Semester Exam Fee: <b>₹2,500</b> per semester.<br/>"
        "• Revaluation Application Fee: <b>₹750</b> per subject. Applications must be submitted within 10 days of results declaration.<br/>"
        "• Photocopy of Answer Script: <b>₹400</b> per script.",
        body_style
    ))

    doc.build(story)


def create_placement_doc():
    filename = "sample_data/Placement_Statistics_and_Policy_2026.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    story = []

    story.append(Paragraph("CENTRE FOR CAREER PLANNING & PLACEMENTS", title_style))
    story.append(Paragraph("Placement Policy, Eligibility Criteria & Annual Statistics 2026", h2_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>1. Placement Eligibility Criteria</b>", h2_style))
    story.append(Paragraph(
        "• Minimum <b>6.5 CGPA</b> with no active backlogs for Super-Dream / Tier-1 companies (CTC >= ₹10 LPA).<br/>"
        "• Minimum <b>6.0 CGPA</b> with maximum 1 standing backlog for Mass Recruiters / Tier-2 companies (CTC ₹4.5 - ₹9 LPA).<br/>"
        "• Mandatory 80% attendance in pre-placement soft-skills and aptitude training sessions.",
        body_style
    ))

    story.append(Paragraph("<b>2. Dream Job Policy</b>", h2_style))
    story.append(Paragraph(
        "A student who receives a placement offer below ₹7.0 LPA remains eligible to participate in 'Dream Offer' drives with CTC exceeding <b>₹12.0 LPA</b>. "
        "Once a Dream Offer is secured, the candidate is automatically de-registered from all subsequent drives.",
        body_style
    ))

    story.append(Paragraph("<b>3. 2025-26 Placement Key Highlights</b>", h2_style))
    table_data = [
        ["Metric", "Value"],
        ["Highest International CTC", "₹44.5 LPA (Amazon AWS)"],
        ["Highest Domestic CTC", "₹32.0 LPA (Microsoft)"],
        ["Average CTC Across Branches", "₹8.4 LPA"],
        ["Median CTC", "₹6.8 LPA"],
        ["Total Companies Visited", "142 Recruiters"],
        ["Overall Placement Percentage", "92.4%"],
    ]
    t = Table(table_data, colWidths=[200, 240])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#059669")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>4. Placement Cell Contact</b>", h2_style))
    story.append(Paragraph(
        "Head of Training & Placements: Dr. Sunita Kulkarni | Placement Block Room 304 | Email: placements@college.edu | Phone: 080-23456799",
        body_style
    ))

    doc.build(story)


if __name__ == "__main__":
    create_mca_doc()
    create_hostel_doc()
    create_calendar_doc()
    create_exam_regulations_doc()
    create_placement_doc()
    print("Generated 5 official sample college PDF documents in sample_data/")
