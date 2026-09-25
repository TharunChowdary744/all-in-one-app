import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

type ToolComponent = LazyExoticComponent<ComponentType>;

/** Web implementations keyed by the tool id from @omnikit/core's registry. Each is code-split. */
export const toolComponents: Record<string, ToolComponent> = {
  'image-converter': lazy(() => import('./ImageConverter')),
  'image-resizer': lazy(() => import('./ImageResizer')),
  'images-to-pdf': lazy(() => import('./ImagesToPdf')),
  'pdf-merge': lazy(() => import('./PdfMerge')),
  'pdf-split': lazy(() => import('./PdfSplit')),
  'pdf-to-images': lazy(() => import('./PdfToImages')),
  'pdf-to-word': lazy(() => import('./PdfToWord')),
  'word-to-html': lazy(() => import('./WordToHtml')),
  'markdown-to-html': lazy(() => import('./MarkdownToHtml')),
  'csv-json': lazy(() => import('./CsvJson')),
  'word-counter': lazy(() => import('./WordCounter')),
  'case-converter': lazy(() => import('./CaseConverter')),
  'text-cleaner': lazy(() => import('./TextCleaner')),
  'json-formatter': lazy(() => import('./JsonFormatter')),
  base64: lazy(() => import('./Base64Tool')),
  'url-encoder': lazy(() => import('./UrlEncoder')),
  'uuid-generator': lazy(() => import('./UuidGenerator')),
  'qr-generator': lazy(() => import('./QrGenerator')),
  'unit-converter': lazy(() => import('./UnitConverter')),
  'color-converter': lazy(() => import('./ColorConverter')),
  'timestamp-converter': lazy(() => import('./TimestampConverter')),
  'password-generator': lazy(() => import('./PasswordGenerator')),
  'hash-generator': lazy(() => import('./HashGenerator')),
};
