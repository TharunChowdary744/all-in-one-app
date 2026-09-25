import { getTool } from '@omnikit/core';
import { createElement, type ComponentType } from 'react';

import Base64Tool from './Base64Tool';
import { FormCalculator } from './calc/FormCalculator';
import { ScientificCalculator } from './calc/ScientificCalculator';
import CaseConverter from './CaseConverter';
import ColorConverter from './ColorConverter';
import CsvJson from './CsvJson';
import HashGenerator from './HashGenerator';
import ImageConverter from './ImageConverter';
import ImageResizer from './ImageResizer';
import ImagesToPdf from './ImagesToPdf';
import JsonFormatter from './JsonFormatter';
import MarkdownToHtml from './MarkdownToHtml';
import PasswordGenerator from './PasswordGenerator';
import QrGenerator from './QrGenerator';
import TextCleaner from './TextCleaner';
import TimestampConverter from './TimestampConverter';
import UnitConverter from './UnitConverter';
import UrlEncoder from './UrlEncoder';
import UuidGenerator from './UuidGenerator';
import WordCounter from './WordCounter';

/** Native implementations keyed by tool id from @omnikit/core. Tools missing here show a "use the web app" screen. */
export const toolScreens: Record<string, ComponentType> = {
  'image-converter': ImageConverter,
  'image-resizer': ImageResizer,
  'images-to-pdf': ImagesToPdf,
  'markdown-to-html': MarkdownToHtml,
  'csv-json': CsvJson,
  'word-counter': WordCounter,
  'case-converter': CaseConverter,
  'text-cleaner': TextCleaner,
  'json-formatter': JsonFormatter,
  base64: Base64Tool,
  'url-encoder': UrlEncoder,
  'uuid-generator': UuidGenerator,
  'qr-generator': QrGenerator,
  'unit-converter': UnitConverter,
  'color-converter': ColorConverter,
  'timestamp-converter': TimestampConverter,
  'password-generator': PasswordGenerator,
  'hash-generator': HashGenerator,
  'scientific-calculator': ScientificCalculator,
  ...Object.fromEntries(
    ['sip-calculator', 'lumpsum-calculator', 'swp-calculator', 'emi-calculator', 'interest-calculator', 'cagr-calculator', 'gst-calculator',
      'percentage-calculator', 'bmi-calculator', 'date-calculator', 'tip-calculator'].map((id) => {
      const category = getTool(id)!.category as 'finance' | 'calculator';
      const Screen: ComponentType = () => createElement(FormCalculator, { toolId: id, category });
      return [id, Screen];
    }),
  ),
};
