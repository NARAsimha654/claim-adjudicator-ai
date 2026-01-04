from fpdf import FPDF
from datetime import datetime
import os

class PDFGenerator:
    """ Generates professional Settlement Advice PDFs """
    
    def generate_settlement_advice(self, claim_data: dict, decision_data: dict, output_path: str):
        pdf = FPDF()
        pdf.add_page()
        
        # Header
        pdf.set_font("Helvetica", "B", 20)
        pdf.set_text_color(30, 41, 59) # Slate 800
        pdf.cell(0, 10, "STRICT AI ADJUDICATOR", ln=True, align="C")
        
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(100, 116, 139) # Slate 500
        pdf.cell(0, 10, f"Issued on {datetime.now().strftime('%d %b %Y, %H:%M')}", ln=True, align="C")
        pdf.ln(10)
        
        # Claim Header
        pdf.set_fill_color(248, 250, 252)
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 12, f"  Settlement Advice: {claim_data['claim_id']}", ln=True, fill=True)
        pdf.ln(5)
        
        # Summary Table
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(40, 10, "Status:")
        pdf.set_font("Helvetica", "", 10)
        verdict = decision_data['verdict']
        if verdict == "APPROVED":
            pdf.set_text_color(21, 128, 61) # Green
        elif verdict == "REJECTED":
            pdf.set_text_color(185, 28, 28) # Red
        else:
            pdf.set_text_color(180, 83, 9) # Amber
        pdf.cell(0, 10, verdict, ln=True)
        pdf.set_text_color(15, 23, 42)
        
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(40, 10, "Member ID:")
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 10, claim_data['member_id'], ln=True)
        
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(40, 10, "Patient Name:")
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 10, claim_data.get('patient_name', 'N/A'), ln=True)
        
        pdf.ln(10)
        
        # Financial Breakdown
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Financial Breakdown", ln=True)
        pdf.set_draw_color(226, 232, 240)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(100, 10, "Description")
        pdf.cell(0, 10, "Amount (INR)", align="R", ln=True)
        pdf.set_font("Helvetica", "", 10)
        
        pdf.cell(100, 10, "Total Claimed Amount")
        pdf.cell(0, 10, f"INR {decision_data['claimed_amount']:,.2f}", align="R", ln=True)
        
        for ded in decision_data.get('deductions', []):
            pdf.set_text_color(185, 28, 28)
            pdf.cell(100, 10, f"Less: {ded['reason']}")
            pdf.cell(0, 10, f"- INR {ded['amount']:,.2f}", align="R", ln=True)
        
        pdf.ln(2)
        pdf.set_text_color(21, 128, 61)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(100, 12, "Final Approved Amount")
        pdf.cell(0, 12, f"INR {decision_data['approved_amount']:,.2f}", align="R", ln=True)
        pdf.set_text_color(15, 23, 42)
        
        pdf.ln(10)
        
        # Decision Trace
        if decision_data.get('decision_trace'):
            pdf.set_font("Helvetica", "B", 14)
            pdf.cell(0, 10, "Adjudication Trace", ln=True)
            pdf.ln(2)
            pdf.set_font("Helvetica", "", 8)
            pdf.set_text_color(71, 85, 105)
            for trace in decision_data['decision_trace']:
                text = f"[{trace['step']}] {trace['status']}: {trace['note']}"
                pdf.multi_cell(0, 5, text)
                pdf.ln(1)
        
        # Footer Note
        pdf.ln(20)
        pdf.set_font("Helvetica", "I", 8)
        pdf.set_text_color(148, 163, 184)
        pdf.multi_cell(0, 5, "This is an AI-generated settlement advice. For any discrepancies, please contact the insurance administrator referencing the Claim ID above.", align="C")
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        pdf.output(output_path)
        return output_path
