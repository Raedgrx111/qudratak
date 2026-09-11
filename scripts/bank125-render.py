"""Render bank125 PDF pages to PNGs + extract answer key from footers."""
import fitz, json, re, os

PDF = '/home/z/my-project/upload/ملف بنك رقم ١٢٥ محوسب محلول.pdf'
OUT = '/home/z/my-project/scripts/gen/bank125'
os.makedirs(OUT, exist_ok=True)

doc = fitz.open(PDF)
print('pages:', len(doc))

answers = {}
for i in range(1, len(doc)):  # skip cover
    page = doc[i]
    text = page.get_text()
    # answer line: الإجابة ب / ج / د / أ
    m = re.search(r'الإجابة\s*([\u0621-\u064A])', text)
    ans = m.group(1) if m else None
    # question number marker like ① ② ... rendered as unicode? check digits
    answers[str(i + 1)] = ans  # page2=Q1 ... page49=Q48
    # render at 2x zoom for good OCR quality
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    pix.save(f'{OUT}/page-{i+1:02d}.png')

with open(f'{OUT}/answers.json', 'w') as f:
    json.dump(answers, f, ensure_ascii=False, indent=1)

print('answer key:', json.dumps(answers, ensure_ascii=False))
vals = [v for v in answers.values() if v]
print(f'extracted {len(vals)}/48 answers')
