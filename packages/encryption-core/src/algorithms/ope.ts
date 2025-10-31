/**
 * OPE - Order-Preserving Encryption
 * Exact port of JavaScript implementation from active-table-records.blade.php
 * DO NOT MODIFY - This is a 1:1 conversion
 */

import CryptoJS from 'crypto-js';
import { AES256 } from './aes-256.js';

export class OPE {
  static ope: OPE | null = null;

  private chunkSize: number;
  private secretKey: string;
  private offsets: number[];
  private multiplier: number;
  private cumSteps?: { [key: number]: number };
  private length?: number;

  constructor(secretKey: string) {
    this.chunkSize = 1;
    this.secretKey = secretKey;

    // Sinh 32 offset từ chuỗi hash
    this.offsets = this.generateChaoticOffsets(secretKey);

    // Tạo HMAC SHA256, output là WordArray
    const prf = CryptoJS.HmacSHA256(`secret|${secretKey}`, secretKey);
    const prfBytes = this.wordArrayToByteString(prf);
    this.multiplier = Math.max(1, this.getUIntFromHash(prfBytes, 0, 5) % 2147483647);
  }

  encryptString(str: string): string {
    this.length = 64;
    return this.encrypt(str, str);
  }

  encryptStringDatetime(str: string): string {
    this.length = 26;
    return this.encrypt(str, str);
  }

  encryptStringDate(str: string): string {
    this.length = 10;
    return this.encrypt(str, str);
  }

  encryptInt(str: string): string {
    this.length = 20;
    return this.encrypt(this.intToLatin(str), str);
  }

  encryptDecimal(str: string, fracLength: number = 10): string {
    this.length = 65;
    return this.encrypt(this.decimalToLatin(str, fracLength), str);
  }

  private encrypt(str: string, origStr: string): string {
    if (!this.cumSteps) {
      this.buildMonotoneMap();
    }
    const length = this.length ?? 64;
    str = str.padStart(length, '\0');
    const numStr = this.stringToAsciiNumber(str);

    const preChunks: string[] = [];
    for (let i = 0; i < numStr.length; i += this.chunkSize * 3) {
      preChunks.push(numStr.slice(i, i + this.chunkSize * 3));
    }

    const chunks = preChunks;

    for (let i = 0; i < chunks.length; i++) {
      const p_num = parseInt(chunks[i] ?? '100'); // 100..355

      const F = this.monotoneF(p_num); // S + m*CUM[p]
      const no = this.boundedNoise(p_num, F); // nhiễu phụ thuộc p (dưới)
      const cInt = F + no;

      chunks[i] = cInt.toString();
    }

    let ciphertext = chunks.join('');

    ciphertext = this.toBaseSecure(ciphertext, this.generateSecretAlphabet(length + (this.offsets[30] ?? 0), 48));
    ciphertext = this.toBaseSecure(
      this.stringToAsciiNumber(ciphertext),
      this.generateSecretAlphabet(length + (this.offsets[31] ?? 0), 48),
    );

    const strong_enc = this.encryptData(origStr, this.secretKey);

    // Nối vào cuối $ciphertext với delimiter '|'
    const full_ciphertext = ciphertext + '|' + strong_enc;

    return full_ciphertext;
  }

  private intToLatin(num: string): string {
    const lettersLower = 'abcdefghijklmnopqrstuvwxyz'.split(''); // cho số dương
    const lettersUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // cho số âm
    const base = 26;

    const numValue = Number(num);

    // Tính chiều dài tối thiểu cần thiết
    const maxPositive = Number.MAX_SAFE_INTEGER;
    const maxNegative = Number.MAX_SAFE_INTEGER;
    const lenPos = Math.ceil(Math.log(maxPositive + 1) / Math.log(base));
    const lenNeg = Math.ceil(Math.log(maxNegative + 1) / Math.log(base));
    const length = Math.max(lenPos, lenNeg);

    // Hàm encode số không âm sang chuỗi latin
    const encode = (value: number, alphabet: string[], len: number): string => {
      let str = '';
      do {
        const remainder = value % base;
        str = alphabet[remainder] + str;
        value = Math.floor(value / base);
      } while (value > 0);

      // pad về cùng length
      return str.padStart(len, alphabet[0]);
    };

    if (numValue >= 0) {
      // Dương: encode trực tiếp, pad bằng 'a'
      return encode(numValue, lettersLower, length);
    }

    // Âm: offset để dịch miền âm về dương, pad bằng 'A'
    const offset = numValue - Number.MIN_SAFE_INTEGER;
    return encode(offset, lettersUpper, length);
  }

  private generateArrayFromKey(secretKey: string, length: number, reductionCount: number): number[] {
    const pool = Array.from({ length: length }, (_, i) => i);

    // Dùng SHA-512 để có đủ byte
    const hashHex = CryptoJS.SHA512(secretKey).toString(CryptoJS.enc.Hex);
    const bytes: number[] = [];
    for (let i = 0; i < hashHex.length; i += 2) {
      bytes.push(parseInt(hashHex.substring(i, i + 2), 16));
    }

    let byteIndex = 0;
    const byteCount = bytes.length;

    // Deterministic shuffle (Fisher-Yates)
    for (let i = pool.length - 1; i > 0; i--) {
      const byte = bytes[byteIndex % byteCount] ?? 0;
      const j = byte % (i + 1);

      const temp = pool[i] ?? 0;
      pool[i] = pool[j] ?? 0;
      pool[j] = temp;
      byteIndex++;
    }

    // Xác định độ dài (1..len) từ byte tiếp theo
    const reductionByte = bytes[byteIndex % byteCount] ?? 0;
    reductionCount = (reductionByte % reductionCount) + 1;

    return pool.slice(0, reductionCount);
  }

  private generateSecretAlphabet(noise: number, minBase: number): string[] {
    // Bảng ký tự an toàn: từ '!' (33) tới '~' (126), loại bỏ '|'
    const alphabet = Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i)).filter((c) => c !== '|');
    const alphabetLength = alphabet.length;
    const pickedPullOffsets = this.generateArrayFromKey(
      `${this.secretKey}|${noise}`,
      alphabetLength,
      alphabetLength - minBase,
    );

    pickedPullOffsets.sort((a, b) => b - a); // Xóa từ cuối để tránh chỉ số thay đổi
    for (const offset of pickedPullOffsets) {
      alphabet.splice(offset, 1);
    }

    return alphabet;
  }

  private toBaseSecure(num: string, alphabet: string[]): string {
    const base = alphabet.length;
    let result = '';

    if (num === '0') {
      result = alphabet[0] ?? '!';
    } else {
      let bigNum = BigInt(num);
      while (bigNum > BigInt(0)) {
        const rem = Number(bigNum % BigInt(base));
        result = (alphabet[rem] ?? '!') + result;
        bigNum = bigNum / BigInt(base);
      }
    }

    return result;
  }

  private decimalToLatin(num: string, precision: number = 10): string {
    const lettersLower = 'abcdefghijklmnopqrstuvwxyz'.split(''); // dương
    const lettersUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // âm
    const base = 26;

    const numValue = Number(num);

    // max length cho phần nguyên
    const maxPositive = Number.MAX_SAFE_INTEGER;
    const maxNegative = Number.MAX_SAFE_INTEGER;
    const lenPos = Math.ceil(Math.log(maxPositive + 1) / Math.log(base));
    const lenNeg = Math.ceil(Math.log(maxNegative + 1) / Math.log(base));
    const length = Math.max(lenPos, lenNeg);

    // hàm encode số nguyên >= 0
    const encodeInt = (value: number, alphabet: string[], len: number): string => {
      value = Math.floor(value);
      let str = '';
      do {
        const remainder = ((value % base) + base) % base; // luôn >= 0
        str = alphabet[remainder] + str;
        value = Math.floor(value / base);
      } while (value > 0);

      return str.padStart(len, alphabet[0]);
    };

    // xử lý dấu
    const isNegative = numValue < 0;
    const absNum = Math.abs(numValue);

    // phần nguyên
    const intPart = Math.floor(absNum);
    const fracPart = absNum - intPart;

    // chọn alphabet
    const alphabet = isNegative ? lettersUpper : lettersLower;

    // nếu âm, offset phần nguyên về miền dương
    let intEncoded: string;
    if (isNegative) {
      const offset = intPart - Number.MIN_SAFE_INTEGER;
      intEncoded = encodeInt(offset, alphabet, length);
    } else {
      intEncoded = encodeInt(intPart, alphabet, length);
    }

    // phần thập phân (encode base-26)
    let fracEncoded = '';
    let f = fracPart;
    for (let i = 0; i < precision && f > 0; i++) {
      f *= base;
      const digit = Math.floor(f);
      fracEncoded += alphabet[digit];
      f -= digit;
    }

    return fracEncoded === '' ? intEncoded : intEncoded + '.' + fracEncoded;
  }

  decrypt(data: string): string {
    const full_ciphertext = data;

    // Tách ciphertext và strong_enc
    const full_parts = full_ciphertext.split('|');
    if (full_parts.length !== 2) {
      return ''; // Định dạng không hợp lệ
    }

    const ciphertext = full_parts[0] ?? '';
    const strong_enc = full_parts[1] ?? '';

    // Giải mã strong_enc để lấy $origStr
    return this.decryptData(strong_enc, this.secretKey);
  }

  private stringToAsciiNumber(str: string): string {
    let numStr = '';
    for (let i = 0; i < str.length; i++) {
      const code = 100 + str.charCodeAt(i);
      numStr += code.toString();
    }
    return numStr;
  }

  private generateChaoticOffsets(key: string, numOffsets: number = 32): number[] {
    const hash = CryptoJS.HmacSHA256(key, this.secretKey).toString(CryptoJS.enc.Hex);
    const x0 = parseInt(hash.substring(0, 8), 16) / 2 ** 32; // Initial from key, 0 < x0 < 1
    const r = 3.999; // Chaotic regime
    const offsets: number[] = [];
    let x = x0;
    let cumulative = 0;
    for (let i = 0; i < numOffsets; i++) {
      x = r * x * (1 - x);
      const offset = Math.floor(x * 1e9); // Large positive offset
      cumulative += offset; // Ensure monotonic increasing
      offsets.push(cumulative % 2147483647);
    }
    return offsets;
  }

  private encryptData(data: string, key: string): string {
    return AES256.encrypt(data, key);
  }

  private decryptData(encryptedData: string, key: string): string {
    return AES256.decrypt(encryptedData, key);
  }

  private buildMonotoneMap(): void {
    const minP = 100,
      maxP = 355;
    const Dmax = 1000;
    let cum = 0;
    this.cumSteps = {};
    for (let p = minP; p <= maxP; p++) {
      // HMAC ra chuỗi nhị phân
      const prf = CryptoJS.HmacSHA256(`step|${p}`, this.secretKey);
      const prfHex = prf.toString(CryptoJS.enc.Hex);
      const prfBytes = prfHex
        .match(/.{2}/g)!
        .map((b) => String.fromCharCode(parseInt(b, 16)))
        .join('');

      // Lấy 4 byte đầu
      const stepRaw = this.getUIntFromHash(prfBytes, 0, 4);
      const step = 1 + (stepRaw % Dmax);

      cum += step;
      this.cumSteps[p] = cum;
    }
  }

  private wordArrayToByteString(wordArray: CryptoJS.lib.WordArray): string {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    let byteStr = '';
    for (let i = 0; i < sigBytes; i++) {
      const word = words[i >>> 2] ?? 0;
      byteStr += String.fromCharCode((word >>> (24 - (i % 4) * 8)) & 0xff);
    }
    return byteStr;
  }

  private getUIntFromHash(bytes: string, start: number, end: number): number {
    let num = 0;
    for (let i = start; i < end && i < bytes.length; i++) {
      num = (num * 256 + bytes.charCodeAt(i)) >>> 0; // nhân 256 thay cho <<, rồi ép 32-bit unsigned
    }
    return num;
  }

  private monotoneF(p_num: number): number {
    let S = 0;
    let offsetHashChain = ''; // giữ dạng string giống PHP

    for (let i = 0; i < 32; i++) {
      // concat số offset vào string
      offsetHashChain = offsetHashChain + (this.offsets[i] ?? 0).toString();

      // convert string sang WordArray để HMAC
      const wa = CryptoJS.enc.Latin1.parse(offsetHashChain);
      const hmac = CryptoJS.HmacSHA256(wa, this.secretKey);

      // convert HMAC sang string bytes
      offsetHashChain = hmac.toString(CryptoJS.enc.Latin1);

      // cộng 4 byte đầu
      S += this.getUIntFromHash(offsetHashChain, 0, 4);
    }

    S = S % 2147483647;

    const cum = this.cumSteps![p_num] || 0;
    return S + this.multiplier * cum;
  }

  private boundedNoise(p_num: number, F: number): number {
    const minGap = Math.max(1, Math.floor(0.1 * this.multiplier));
    const max = Math.max(minGap, Math.floor(0.8 * this.multiplier));

    // PRF an toàn hơn
    const prf = CryptoJS.HmacSHA256(`noise|${p_num}|${F}`, this.secretKey);
    const prfHex = prf.toString(CryptoJS.enc.Hex);
    const prfBytes = prfHex
      .match(/.{2}/g)!
      .map((b) => String.fromCharCode(parseInt(b, 16)))
      .join('');

    const h = this.getUIntFromHash(prfBytes, 0, 4);
    return h % max;
  }
}

// Legacy alias for backward compatibility
export const OPEncryptor = OPE;
