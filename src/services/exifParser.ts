/**
 * Browser-native EXIF Parser for Disaster & Field Evidence Imagery
 * Extracts GPS Coordinates, Altitude, Timestamp, and Camera info without external dependencies.
 */

export interface ParsedExifData {
  hasExif: boolean;
  hasGps: boolean;
  lat?: number;
  lng?: number;
  altitude?: number; // in meters MSL
  timestamp?: string;
  make?: string;
  model?: string;
  raw?: Record<string, any>;
}

export class ExifParser {
  /**
   * Reads an image File or Blob and returns parsed EXIF data
   */
  static async parseImage(file: File | Blob): Promise<ParsedExifData> {
    try {
      const buffer = await file.slice(0, 128 * 1024).arrayBuffer(); // First 128KB is enough for EXIF headers
      return this.parseBuffer(buffer);
    } catch (err) {
      console.warn('EXIF parsing failed:', err);
      return { hasExif: false, hasGps: false };
    }
  }

  /**
   * Parses ArrayBuffer looking for APP1 Exif Marker
   */
  static parseBuffer(buffer: ArrayBuffer): ParsedExifData {
    const view = new DataView(buffer);
    if (view.byteLength < 32) return { hasExif: false, hasGps: false };

    // Check JPEG SOI (0xFFD8)
    if (view.getUint16(0) !== 0xffd8) {
      return { hasExif: false, hasGps: false };
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset + 4 < length) {
      const marker = view.getUint16(offset);
      offset += 2;

      if (marker === 0xffe1) {
        // APP1 Marker (EXIF)
        const app1Length = view.getUint16(offset);
        offset += 2;

        // Check for 'Exif\0\0' (0x45, 0x78, 0x69, 0x66, 0x00, 0x00)
        const isExif =
          view.getUint8(offset) === 0x45 &&
          view.getUint8(offset + 1) === 0x78 &&
          view.getUint8(offset + 2) === 0x69 &&
          view.getUint8(offset + 3) === 0x66 &&
          view.getUint8(offset + 4) === 0x00 &&
          view.getUint8(offset + 5) === 0x00;

        if (isExif) {
          const tiffStart = offset + 6;
          return this.readTiffHeader(view, tiffStart, app1Length - 8);
        }

        offset += app1Length - 2;
      } else if ((marker & 0xff00) === 0xff00) {
        // Other JPEG marker, skip by length
        if (offset + 2 > length) break;
        const markerLength = view.getUint16(offset);
        offset += markerLength;
      } else {
        break;
      }
    }

    return { hasExif: false, hasGps: false };
  }

  private static readTiffHeader(view: DataView, tiffStart: number, maxBytes: number): ParsedExifData {
    if (tiffStart + 8 > view.byteLength) return { hasExif: true, hasGps: false };

    const byteOrder = view.getUint16(tiffStart);
    const littleEndian = byteOrder === 0x4949; // 'II'

    // Verify 42 (0x002A)
    if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002a) {
      return { hasExif: true, hasGps: false };
    }

    const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
    if (firstIfdOffset < 8) return { hasExif: true, hasGps: false };

    let gpsPointer: number | null = null;
    let exifPointer: number | null = null;
    let make: string | undefined;
    let model: string | undefined;
    let dateTime: string | undefined;

    // Read IFD0
    const ifd0Start = tiffStart + firstIfdOffset;
    if (ifd0Start + 2 > view.byteLength) return { hasExif: true, hasGps: false };

    const entriesCount = view.getUint16(ifd0Start, littleEndian);
    let entryOffset = ifd0Start + 2;

    for (let i = 0; i < entriesCount; i++) {
      if (entryOffset + 12 > view.byteLength) break;
      const tag = view.getUint16(entryOffset, littleEndian);
      const type = view.getUint16(entryOffset + 2, littleEndian);
      const count = view.getUint32(entryOffset + 4, littleEndian);

      if (tag === 0x010f) {
        // Make
        make = this.readStringValue(view, tiffStart, entryOffset + 8, count, littleEndian);
      } else if (tag === 0x0110) {
        // Model
        model = this.readStringValue(view, tiffStart, entryOffset + 8, count, littleEndian);
      } else if (tag === 0x0132) {
        // DateTime
        dateTime = this.readStringValue(view, tiffStart, entryOffset + 8, count, littleEndian);
      } else if (tag === 0x8825) {
        // GPSInfo IFD Pointer
        gpsPointer = view.getUint32(entryOffset + 8, littleEndian);
      } else if (tag === 0x8769) {
        // Exif IFD Pointer
        exifPointer = view.getUint32(entryOffset + 8, littleEndian);
      }

      entryOffset += 12;
    }

    let lat: number | undefined;
    let lng: number | undefined;
    let altitude: number | undefined;

    // Read GPS IFD if present
    if (gpsPointer !== null && tiffStart + gpsPointer + 2 <= view.byteLength) {
      const gpsIfdStart = tiffStart + gpsPointer;
      const gpsEntries = view.getUint16(gpsIfdStart, littleEndian);
      let gpsOffset = gpsIfdStart + 2;

      let latRef = 'N';
      let lngRef = 'E';
      let latDms: number[] | null = null;
      let lngDms: number[] | null = null;
      let altVal: number | null = null;
      let altRef = 0;

      for (let j = 0; j < gpsEntries; j++) {
        if (gpsOffset + 12 > view.byteLength) break;
        const tag = view.getUint16(gpsOffset, littleEndian);

        if (tag === 0x0001) {
          // GPSLatitudeRef ('N' or 'S')
          latRef = String.fromCharCode(view.getUint8(gpsOffset + 8));
        } else if (tag === 0x0002) {
          // GPSLatitude (3 rationals)
          const valOffset = view.getUint32(gpsOffset + 8, littleEndian);
          latDms = this.readRationals(view, tiffStart + valOffset, 3, littleEndian);
        } else if (tag === 0x0003) {
          // GPSLongitudeRef ('E' or 'W')
          lngRef = String.fromCharCode(view.getUint8(gpsOffset + 8));
        } else if (tag === 0x0004) {
          // GPSLongitude (3 rationals)
          const valOffset = view.getUint32(gpsOffset + 8, littleEndian);
          lngDms = this.readRationals(view, tiffStart + valOffset, 3, littleEndian);
        } else if (tag === 0x0005) {
          // GPSAltitudeRef (0 = above sea level, 1 = below)
          altRef = view.getUint8(gpsOffset + 8);
        } else if (tag === 0x0006) {
          // GPSAltitude (1 rational)
          const valOffset = view.getUint32(gpsOffset + 8, littleEndian);
          const rationals = this.readRationals(view, tiffStart + valOffset, 1, littleEndian);
          if (rationals && rationals[0] !== undefined) {
            altVal = rationals[0];
          }
        }

        gpsOffset += 12;
      }

      if (latDms && latDms.length >= 3) {
        lat = latDms[0] + latDms[1] / 60 + latDms[2] / 3600;
        if (latRef === 'S') lat = -lat;
      }

      if (lngDms && lngDms.length >= 3) {
        lng = lngDms[0] + lngDms[1] / 60 + lngDms[2] / 3600;
        if (lngRef === 'W') lng = -lng;
      }

      if (altVal !== null) {
        altitude = altRef === 1 ? -altVal : altVal;
        altitude = Math.round(altitude * 10) / 10;
      }
    }

    const hasGps = typeof lat === 'number' && typeof lng === 'number';

    return {
      hasExif: true,
      hasGps,
      lat: hasGps ? Number(lat?.toFixed(6)) : undefined,
      lng: hasGps ? Number(lng?.toFixed(6)) : undefined,
      altitude,
      timestamp: dateTime,
      make: make?.trim(),
      model: model?.trim(),
    };
  }

  private static readRationals(
    view: DataView,
    offset: number,
    count: number,
    littleEndian: boolean
  ): number[] | null {
    if (offset + count * 8 > view.byteLength) return null;
    const res: number[] = [];
    for (let i = 0; i < count; i++) {
      const num = view.getUint32(offset + i * 8, littleEndian);
      const den = view.getUint32(offset + i * 8 + 4, littleEndian);
      if (den === 0) {
        res.push(0);
      } else {
        res.push(num / den);
      }
    }
    return res;
  }

  private static readStringValue(
    view: DataView,
    tiffStart: number,
    offsetOrInline: number,
    count: number,
    littleEndian: boolean
  ): string {
    if (count <= 4) {
      let str = '';
      for (let i = 0; i < count; i++) {
        const c = view.getUint8(offsetOrInline + i);
        if (c === 0) break;
        str += String.fromCharCode(c);
      }
      return str;
    }

    const offset = view.getUint32(offsetOrInline, littleEndian);
    const absStart = tiffStart + offset;
    if (absStart + count > view.byteLength) return '';

    let str = '';
    for (let i = 0; i < count; i++) {
      const c = view.getUint8(absStart + i);
      if (c === 0) break;
      str += String.fromCharCode(c);
    }
    return str;
  }
}
