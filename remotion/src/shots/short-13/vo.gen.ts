// PLACEHOLDER — ELEVENLABS_API_KEY missing from .env, so this mirrors beats.json's
// ESTIMATED line windows (no per-word alignment). Once the key is set, regenerate with:
//   python tools/gen_voice.py --beats shorts/short-13-bubble-sort/beats.json \
//       --voice <a Vietnamese-capable ElevenLabs voice id> \
//       --emit-ts remotion/src/shots/short-13/vo.gen.ts
// That overwrites this file with real per-word timings; never hand-edit after that.
import type { VoLine } from '../../lib/shorts';

export const VO: VoLine[] = [
  { text: 'Thuật toán sắp xếp chậm nhất. Nhưng dễ hiểu nhất.', start: 0.4, end: 3.6 },
  { text: 'Sáu con số, xáo trộn hoàn toàn.', start: 3.8, end: 6.0 },
  { text: 'Luật chỉ có một: so sánh hai ô cạnh nhau.', start: 6.4, end: 10.0 },
  { text: 'Nếu bên trái lớn hơn, đổi chỗ cho nhau.', start: 10.4, end: 14.6 },
  { text: 'Đoán xem: số nào sẽ về đúng chỗ, sau một lượt?', start: 15.6, end: 18.4 },
  { text: 'Số lớn nhất, giống một bong bóng,', start: 18.8, end: 21.6 },
  { text: 'nổi dần về cuối mảng, sau mỗi lượt so sánh.', start: 21.8, end: 25.2 },
  { text: 'Lặp lại lượt hai, lượt ba... cho đến khi xong.', start: 25.8, end: 29.4 },
  { text: 'Sáu phần tử — chỉ mười lăm phép so sánh.', start: 29.6, end: 32.8 },
  { text: 'Một triệu phần tử ư? Gần năm trăm tỷ phép so sánh.', start: 33.2, end: 37.2 },
  { text: 'Chậm... nhưng chẳng thuật toán nào dễ hiểu hơn.', start: 37.6, end: 39.8 },
];
