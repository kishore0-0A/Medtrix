import io
import re
from typing import Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import winocr

app = FastAPI(title="Medtrix Clinical OCR Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

KNOWN_FORMS = [
    "Tablet", "Tablets", "Capsule", "Capsules", "Syrup", "Suspension", 
    "Injection", "Ointment", "Cream", "Gel", "Drops", "Inhaler", "Powder"
]

COMMON_GENERICS = [
    "Paracetamol", "Acetaminophen", "Amoxicillin", "Ibuprofen", "Cetirizine",
    "Azithromycin", "Metformin", "Pantoprazole", "Omeprazole", "Atorvastatin",
    "Amlodipine", "Losartan", "Diclofenac", "Ciprofloxacin", "Doxycycline"
]

def parse_medicine_text(raw_text: str) -> Dict[str, Any]:
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    full_text = " ".join(lines)
    
    # 1. Strength (e.g., 500mg, 650 mg, 10ml, 5mg/5ml)
    strength_match = re.search(r'(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|%w\/v|%w\/w|IU))\b', full_text, re.IGNORECASE)
    strength = strength_match.group(1).strip() if strength_match else None

    # 2. Dosage Form
    dosage_form = None
    for form in KNOWN_FORMS:
        if re.search(rf'\b{form}\b', full_text, re.IGNORECASE):
            dosage_form = form.capitalize()
            break

    # 3. Batch / Lot Number (handles OCR variances like aztch, b.no, lot no)
    batch_match = re.search(r'(?:B\.?\s*No\.?|Batch\s*(?:No\.?)?|Lot\s*(?:No\.?)?|[a-z]tch\s*(?:no\.?)?)\s*[:.-]?\s*([A-Za-z0-9\/-]+)', full_text, re.IGNORECASE)
    batch_number = batch_match.group(1).strip() if batch_match else None

    # 4. Manufacturing Date (e.g. 01/2024, 01-24, Jan 2024)
    mfg_match = re.search(r'(?:Mfg|Mfg\.?\s*Date|Mfd\.?)\s*[:.-]?\s*([0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]{3}[/-][0-9]{2,4})', full_text, re.IGNORECASE)
    mfg_date = mfg_match.group(1).strip() if mfg_match else None

    # 5. Expiry Date (e.g. 12/2027, 12-27, Dec 2027)
    exp_match = re.search(r'(?:Exp|Exp\.?\s*Date|Expiry)\s*[:.-]?\s*([0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]{3}[/-][0-9]{2,4})', full_text, re.IGNORECASE)
    exp_date = exp_match.group(1).strip() if exp_match else None

    # 6. MRP / Price (e.g. MRP Rs. 42.50, MRP 55.00, Rs. 120)
    mrp_match = re.search(r'(?:M\.?R\.?P\.?|Price|Rs\.?|₹)\s*[:.-]?\s*(?:Rs\.?|₹)?\s*([0-9]+(?:\.[0-9]{1,2})?)', full_text, re.IGNORECASE)
    mrp = None
    if mrp_match:
        val = float(mrp_match.group(1))
        # If OCR dropped the dot (e.g. 3400 for 34.00), adjust if > 500 without decimals
        if val > 500 and '.' not in mrp_match.group(1):
            val = val / 100.0
        mrp = val

    # 7. Pack Size (e.g. 10 Tablets, 15 Caps - avoids matching strength numbers like 650)
    pack_match = re.search(r'\b([1-9][0-9]?)\s*(?:x\s*\d+\s*)?(?:Tablets?|Capsules?|Strips?|tabs?|caps?)\b', full_text, re.IGNORECASE)
    pack_size = int(pack_match.group(1)) if pack_match else (10 if dosage_form in ['Tablet', 'Capsule', 'Tablets', 'Capsules'] else 1)

    # 8. Medicine Name & Generic Name
    medicine_name = None
    generic_name = None

    for gen in COMMON_GENERICS:
        if re.search(rf'\b{gen}\b', full_text, re.IGNORECASE):
            generic_name = gen
            break

    # Look for capitalized title / prominent lines
    for line in lines[:5]:
        cleaned = re.sub(r'[^A-Za-z0-9\s-]', '', line).strip()
        # Avoid lines that are just numbers, dates, or headers
        if len(cleaned) >= 3 and not re.search(r'(?:mfg|exp|batch|mrp|strip|keep|store)', cleaned, re.IGNORECASE):
            medicine_name = cleaned
            break

    if not medicine_name:
        medicine_name = generic_name or "Detected Medicine"

    # 9. Manufacturer
    manufacturer = None
    for line in lines:
        if re.search(r'(?:Mfg\s+by|Marketed\s+by|Laboratories|Pharma|Ltd|Inc)\b', line, re.IGNORECASE):
            manufacturer = line.strip()
            break

    # 10. Prescription / Caution
    prescription_info = None
    if re.search(r'Schedule\s+[H|X|G]', full_text, re.IGNORECASE):
        prescription_info = "Schedule H Prescription Drug - Caution"
    elif re.search(r'Prescription', full_text, re.IGNORECASE):
        prescription_info = "Prescription Required"

    return {
        "medicine_name": medicine_name,
        "generic_name": generic_name or medicine_name,
        "active_ingredient": f"{generic_name or medicine_name} {strength or ''}".strip(),
        "composition": f"Each {dosage_form or 'unit'} contains: {generic_name or medicine_name} {strength or ''}".strip(),
        "strength": strength,
        "dosage_form": dosage_form or "Tablet",
        "manufacturer_name": manufacturer or "Pharmaceutical Manufacturer",
        "manufacturer_address": None,
        "manufacturing_license_number": None,
        "batch_number": batch_number or "BT-AUTO",
        "lot_number": None,
        "manufacturing_date": mfg_date,
        "expiry_date": exp_date,
        "mrp": mrp or 50.0,
        "currency": "INR",
        "pack_size": pack_size,
        "pack_unit": "tablets" if dosage_form == "Tablet" else "units",
        "barcode": None,
        "gtin": None,
        "qr_code": None,
        "storage_instructions": "Store protected from light and moisture.",
        "prescription_info": prescription_info,
        "warnings": "Take as directed by a registered medical practitioner.",
        "customer_care": None,
        "website": None,
        "raw_text": raw_text
    }

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Medtrix Clinical OCR Backend",
        "engine": "Windows Native OCR (winocr)",
        "port": 8000
    }

@app.post("/api/v1/scan")
def scan_medicine_cover(file: UploadFile = File(...)):
    try:
        contents = file.file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        # Open image with PIL
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # Run Windows native OCR synchronously in worker thread
        ocr_result = winocr.recognize_pil_sync(image, "en")
        raw_text = ocr_result.get("text", "")

        # Parse medicine structured entities
        data = parse_medicine_text(raw_text)

        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
