import io
import re
import difflib
from typing import Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps, ImageEnhance
import winocr

app = FastAPI(title="Medtrix Clinical OCR Backend", version="1.1.0")

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

COMMON_BRANDS = {
    "dolo": ("Dolo 650", "Paracetamol"),
    "crocin": ("Crocin", "Paracetamol"),
    "calpol": ("Calpol", "Paracetamol"),
    "augmentin": ("Augmentin", "Amoxicillin and Clavulanate"),
    "amoxil": ("Amoxil", "Amoxicillin"),
    "pan": ("Pan 40", "Pantoprazole"),
    "telma": ("Telma", "Telmisartan"),
    "azithral": ("Azithral", "Azithromycin"),
    "advil": ("Advil", "Ibuprofen"),
    "tylenol": ("Tylenol", "Acetaminophen"),
    "glycomet": ("Glycomet", "Metformin"),
    "lipitor": ("Lipitor", "Atorvastatin"),
    "norvasc": ("Norvasc", "Amlodipine"),
    "cipflox": ("Cipro", "Ciprofloxacin")
}

def parse_medicine_text(raw_text: str) -> Dict[str, Any]:
    import unicodedata
    # Normalize unicode accents (e.g. ä -> a, ö -> o)
    raw_text = unicodedata.normalize('NFKD', raw_text).encode('ASCII', 'ignore').decode('utf-8')
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    full_text = " ".join(lines)
    
    # 1. Strength (e.g. 500mg, 650 mg, or OCR-truncated 500m / 500 without mg)
    strength_match = re.search(r'(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|%w\/v|%w\/w|IU))\b', full_text, re.IGNORECASE)
    if strength_match:
        strength = strength_match.group(1).strip()
    else:
        # Match common OCR-truncated strengths like "500m", "650m", "250m"
        m_trunc = re.search(r'\b(\d{2,4})\s*m\b', full_text, re.IGNORECASE)
        if m_trunc:
            strength = f"{m_trunc.group(1)}mg"
        else:
            # Match number directly following medicine name (e.g. "AMOXICILLIN 500", "DOLO 650")
            m_num = re.search(r'\b(?:amoxicillin|amoxil|dolo|augmentin|paracetamol|crocin|calpol|azithral|metformin|pantoprazole|pan)\s*([0-9]{2,4})\b', full_text, re.IGNORECASE)
            strength = f"{m_num.group(1)}mg" if m_num else None

    # 2. Dosage Form (matches Tablet, Tablets, Tabletby, etc.)
    dosage_form = None
    for form in KNOWN_FORMS:
        if re.search(rf'\b{form}', full_text, re.IGNORECASE):
            dosage_form = form.capitalize()
            break

    # 3. Batch / Lot Number (handles OCR typos like oatch, aztch, b.no, # substitution)
    batch_matches = re.findall(r'(?:Batch\s*(?:No\.?)?|Lot\s*(?:No\.?)?|B\.?\s*No\.?|[o|a]tch\s*(?:no\.?)?)\s*[:.-]?\s*([A-Za-z0-9#\)\/\.-]+)', full_text, re.IGNORECASE)
    batch_number = None
    if batch_matches:
        for candidate in batch_matches:
            cleaned = re.sub(r'[\)#]', '8', candidate)
            cleaned = re.sub(r'[^A-Za-z0-9\/-]', '', cleaned).strip()
            # If batch has digits followed by random lowercase OCR noise like '3filj', trim to digits
            m_trim = re.match(r'^([A-Z0-9\/-]*\d+[A-Z0-9]*)', cleaned, re.IGNORECASE)
            if m_trim:
                cleaned = m_trim.group(1)
            if len(cleaned) >= 3 and any(c.isdigit() for c in cleaned):
                batch_number = cleaned
                break
        if not batch_number and batch_matches:
            batch_number = re.sub(r'[^A-Za-z0-9\/-]', '', batch_matches[0]).strip()

    # 4 & 5. Manufacturing Date & Expiry Date
    mfg_date = None
    exp_date = None

    exp_match = re.search(r'(?:Exp|Exp\.?\s*Date|Expiry)\s*[:.-]?\s*([0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]{3}[/-][0-9]{2,4})', full_text, re.IGNORECASE)
    if exp_match:
        exp_date = exp_match.group(1).strip()

    mfg_match = re.search(r'(?:Mfg|Mfg\.?\s*Date|Mfd\.?)\s*[:.-]?\s*([0-9]{1,2}[/-][0-9]{2,4}|[A-Za-z]{3}[/-][0-9]{2,4})', full_text, re.IGNORECASE)
    if mfg_match:
        mfg_date = mfg_match.group(1).strip()

    # Heuristic: if exp_date is missing, parse chronological date pair
    if not exp_date or not mfg_date:
        all_dates = re.findall(r'\b([0-9]{1,2}[/-][0-9]{2,4})\b', full_text)
        if len(all_dates) >= 2:
            def parse_d_key(d_str):
                parts = re.split(r'[/-]', d_str)
                m = int(parts[0]) if len(parts) > 1 and parts[0].isdigit() else 1
                y = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else int(parts[0]) if parts[0].isdigit() else 2000
                if y < 100: y += 2000
                return (y, m)
            try:
                sorted_dates = sorted(all_dates, key=parse_d_key)
                if not mfg_date:
                    mfg_date = sorted_dates[0]
                if not exp_date:
                    exp_date = sorted_dates[-1]
            except Exception:
                pass
        elif len(all_dates) == 1 and not exp_date:
            exp_date = all_dates[0]

    # 6. MRP / Price (e.g. MRP Rs. 42.50, MRP 55.00, Rs. 120)
    mrp_match = re.search(r'(?:M\.?R\.?P\.?|Price|Rs\.?|₹)\s*[:.-]?\s*(?:Rs\.?|₹)?\s*([0-9]+(?:\.[0-9]{1,2})?)', full_text, re.IGNORECASE)
    mrp = None
    if mrp_match:
        val = float(mrp_match.group(1))
        # If OCR dropped the dot (e.g. 3400 for 34.00), adjust if > 500 without decimals
        if val > 500 and '.' not in mrp_match.group(1):
            val = val / 100.0
        mrp = val

    # 7. Pack Size / Stock Quantity
    pack_match = re.search(r'(?:STOCK|STCCK|QTY)\s*[:.-]?\s*(\d+)', full_text, re.IGNORECASE)
    if not pack_match:
        pack_match = re.search(r'\b([1-9][0-9]{0,2})\s*(?:x\s*\d+\s*)?(?:Tablets?|Capsules?|Strips?|tabs?|caps?|UNITS?)\b', full_text, re.IGNORECASE)
    if not pack_match:
        # Check prescription label quantity pattern e.g. "DAILY 30"
        pack_match = re.search(r'(?:DAILY|MOUTH)\s+(\d{1,3})\b', full_text, re.IGNORECASE)
    pack_size = int(pack_match.group(1)) if pack_match else (10 if dosage_form in ['Tablet', 'Capsule', 'Tablets', 'Capsules'] else 1)

    # 8. Medicine Name & Generic Name (Intelligent Clinical Extraction)
    medicine_name = None
    generic_name = None

    words = re.findall(r'[A-Za-z0-9]+', full_text)
    for w in words:
        wl = w.lower()
        # Prefix matching for common stems
        if wl.startswith('amox') or wl.startswith('amok'):
            generic_name = "Amoxicillin"
            medicine_name = "Amoxicillin"
            break
        if wl.startswith('paracet'):
            generic_name = "Paracetamol"
            medicine_name = "Paracetamol"
            break
        if wl.startswith('ibuprof'):
            generic_name = "Ibuprofen"
            medicine_name = "Ibuprofen"
            break
        if wl.startswith('azithro') or wl.startswith('azith'):
            generic_name = "Azithromycin"
            medicine_name = "Azithromycin"
            break
        if wl.startswith('pantop'):
            generic_name = "Pantoprazole"
            medicine_name = "Pantoprazole"
            break
        if wl in COMMON_BRANDS:
            medicine_name, generic_name = COMMON_BRANDS[wl]
            break

        # Fuzzy match across generics
        close = difflib.get_close_matches(w.title(), COMMON_GENERICS, n=1, cutoff=0.65)
        if close:
            generic_name = close[0]
            medicine_name = close[0]
            break

    # If generic found and strength available, format clinical name e.g. "Amoxicillin 500mg"
    if medicine_name and strength and strength not in medicine_name:
        medicine_name = f"{medicine_name} {strength}"

    # Fallback to cleaning candidate title lines, stripping patient/Rx prefixes
    if not medicine_name:
        for line in lines[:5]:
            # Remove Rx, PATIENT, and instruction clauses
            cleaned = re.sub(r'^(?:Rx\s*\d+|PATIENT:?|DR:?|PHARMACY:?)\s*', '', line, flags=re.IGNORECASE).strip()
            cleaned = re.sub(r'[^A-Za-z0-9\s-]', '', cleaned).strip()
            # Exclude lines that are purely directions or metadata
            if len(cleaned) >= 3 and not re.search(r'(?:mfg|exp|batch|mrp|take|mouth|daily|refill|keep|store|stock)', cleaned, re.IGNORECASE):
                medicine_name = cleaned[:40]
                break

    if not medicine_name:
        medicine_name = generic_name or "Detected Medicine"

    # 9. Prescription Info / Patient / Rx Number
    prescription_info = None
    rx_m = re.search(r'\bRx\s*([0-9A-Za-z]+)', full_text, re.IGNORECASE)
    dir_m = re.search(r'(TAKE\s+[^.]+?(?:DAILY|DAY|HOURS?|MOUTH))', full_text, re.IGNORECASE)
    if rx_m or dir_m:
        parts = []
        if rx_m:
            parts.append(f"Rx #{rx_m.group(1)}")
        if dir_m:
            parts.append(dir_m.group(1).title())
        prescription_info = " - ".join(parts)
    elif re.search(r'Schedule\s+[H|X|G]', full_text, re.IGNORECASE):
        prescription_info = "Schedule H Prescription Drug - Caution"
    elif re.search(r'Prescription', full_text, re.IGNORECASE):
        prescription_info = "Prescription Required"

    # 10. Manufacturer
    manufacturer = None
    for line in lines:
        if re.search(r'(?:Mfg\s+by|Marketed\s+by|Laboratories|Pharma|Ltd|Inc)\b', line, re.IGNORECASE):
            manufacturer = line.strip()
            break

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
        "pack_unit": "tablets" if dosage_form in ["Tablet", "Tablets"] else "units",
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

        # Pass 1: Raw image OCR
        ocr_result = winocr.recognize_pil_sync(image, "en")
        raw_text = ocr_result.get("text", "").strip()

        # Pass 2: Grayscale + Auto-contrast if raw text is empty/insufficient
        if len(raw_text) < 5:
            gray = ImageOps.autocontrast(ImageOps.grayscale(image))
            ocr_result = winocr.recognize_pil_sync(gray, "en")
            raw_text = ocr_result.get("text", "").strip()

        # Pass 3: Grayscale + Contrast Boost (2.2x) + Sharpness (1.8x)
        if len(raw_text) < 5:
            enhanced = ImageEnhance.Sharpness(ImageEnhance.Contrast(gray).enhance(2.2)).enhance(1.8)
            ocr_result = winocr.recognize_pil_sync(enhanced, "en")
            raw_text = ocr_result.get("text", "").strip()

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
