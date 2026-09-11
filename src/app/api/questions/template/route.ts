import { requireStaff } from '@/lib/auth'
import { handle } from '@/lib/api'
import * as XLSX from 'xlsx'

// GET /api/questions/template — تنزيل قالب Excel جاهز للتعبئة
export async function GET() {
  return handle(async () => {
    await requireStaff()
    const rows = [
      {
        'القسم': 'كمي',
        'الموضوع': 'الحساب والنسبة المئوية',
        'الصعوبة': 'سهل',
        'السؤال': 'ما هي قيمة 25% من العدد 200؟',
        'الخيار أ': '40',
        'الخيار ب': '50',
        'الخيار ج': '60',
        'الخيار د': '75',
        'الإجابة': 'ب',
        'الشرح': '25% = 25÷100 = 0.25 ثم 0.25 × 200 = 50',
        'المصدر': 'بنك قدراتك',
      },
      {
        'القسم': 'لفظي',
        'الموضوع': 'التناظر اللفظي',
        'الصعوبة': 'متوسط',
        'السؤال': 'قلم : كتابة\n\nأي العلاقات التالية تشبه العلاقة بين الكلمتين أعلاه؟',
        'الخيار أ': 'مطرقة : بناء',
        'الخيار ب': 'خبز : فرن',
        'الخيار ج': 'نافذة : جدار',
        'الخيار د': 'حرف : خطأ',
        'الإجابة': 'أ',
        'الشرح': 'العلاقة: أداة ووظيفتها؛ فالقلم أداة للكتابة والمطرقة أداة للبناء',
        'المصدر': 'بنك قدراتك',
      },
      {
        'القسم': 'كمي',
        'الموضوع': 'الهندسة والمساحات',
        'الصعوبة': 'صعب',
        'السؤال': 'مثلث قائم الزاوية طول ضلعي القائمة 6 سم و 8 سم. ما طول الوتر؟',
        'الخيار أ': '9 سم',
        'الخيار ب': '10 سم',
        'الخيار ج': '12 سم',
        'الخيار د': '14 سم',
        'الإجابة': 'ب',
        'الشرح': '(الوتر)² = 6² + 8² = 36 + 64 = 100، إذن الوتر = 10 سم',
        'المصدر': 'بنك قدراتك',
      },
    ]
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [
      { wch: 8 }, { wch: 22 }, { wch: 8 }, { wch: 45 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 8 }, { wch: 50 }, { wch: 14 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'قالب الأسئلة')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    return new Response(buf as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="qudratak-import-template.xlsx"`,
      },
    })
  })
}
