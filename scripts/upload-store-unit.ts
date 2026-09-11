/**
 * اختبار وحدة تخزين الرفع: حفظ تدفق + صورة مصغرة + مدة + حذف نظيف
 */
import { createReadStream, existsSync } from 'fs'
import { Readable } from 'stream'
import {
  generatePoster,
  saveClipStream,
  newClipFilename,
  resolveClipFile,
  probeDurationSec,
  deleteClipFiles,
} from '../src/lib/upload-store'

async function main() {
  const fs = await import('fs')
  const name = newClipFilename('mp4')
  console.log('storage name:', name)
  const stream = Readable.toWeb(createReadStream('/tmp/clip-test/sample.mp4')) as Parameters<typeof saveClipStream>[0]
  const size = await saveClipStream(stream, name)
  console.log('saved size:', size)
  const abs = resolveClipFile(name)
  console.log('abs exists:', abs ? existsSync(abs) : false)
  const dur = abs ? await probeDurationSec(abs) : null
  console.log('duration:', dur)
  const poster = await generatePoster(name)
  console.log('poster:', poster, '| poster exists:', poster ? existsSync(resolveClipFile(poster)!) : false)
  deleteClipFiles(name, poster)
  console.log('after delete → video exists:', abs ? existsSync(abs) : false, '| poster exists:', poster ? existsSync(resolveClipFile(poster)!) : false)
  if (abs && existsSync(abs)) {
    console.error('FAIL: video not deleted')
    process.exit(1)
  }
  if (poster && existsSync(resolveClipFile(poster)!)) {
    console.error('FAIL: poster not deleted')
    process.exit(1)
  }
  console.log('UNIT OK')
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})
