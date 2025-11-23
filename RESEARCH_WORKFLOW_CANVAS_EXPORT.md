# Research Report: Workflow Canvas Export to PNG/SVG

Date: 2025-11-20 | Focus: XYFlow (@xyflow/react) Implementation

## Executive Summary

XYFlow provides robust export capabilities via `html-to-image` library (v1.11.11 locked). Supports PNG, JPEG, SVG, Blob outputs. Official example provided. Trade-off: HTML+SVG mixed content → pure SVG export limited.

---

## 1. EXPORT METHODS

### Primary Method: html-to-image Library

**Installation:**

```bash
npm install html-to-image@1.11.11
```

**Available Functions:**

- `toPng()` - PNG base64 dataURL (recommended for quality)
- `toJpeg()` - JPEG with quality control (0-1 range)
- `toSvg()` - SVG dataURL (edges may render as DOM raster)
- `toBlob()` - Binary blob object
- `toCanvas()` - HTMLCanvasElement
- `toPixelData()` - Raw Uint8Array pixels

### Official React Flow Implementation

```typescript
import { getNodesBounds, getViewportForBounds, useReactFlow, Panel } from '@xyflow/react';
import { toPng } from 'html-to-image';

const DownloadButton = () => {
  const { getNodes } = useReactFlow();

  const onClick = () => {
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(nodesBounds, 1024, 768, 0.5, 2);

    toPng(document.querySelector('.react-flow__viewport'), {
      backgroundColor: '#1a365d',
      width: 1024,
      height: 768,
      style: {
        width: '1024px',
        height: '768px',
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then(dataUrl => {
      const a = document.createElement('a');
      a.setAttribute('download', 'workflow.png');
      a.setAttribute('href', dataUrl);
      a.click();
    });
  };

  return <Panel position="top-right"><button onClick={onClick}>Download</button></Panel>;
};
```

---

## 2. QUALITY CONSIDERATIONS

### PNG Export

- **Pros**: High quality, lossless, best for viewing; default `pixelRatio: 1`
- **Cons**: Larger file sizes
- **Setting**: Use default or `pixelRatio: window.devicePixelRatio` for retina screens
- **Background**: `backgroundColor` option (CSS color string)

### JPEG Export

- **Pros**: Smaller file size, compression control
- **Cons**: Lossy, artifacts on edges/text
- **Setting**: `quality: 0.85-0.95` recommended
- **Use Case**: Preview exports, thumbnails

### SVG Export

- **Limitation**: Hybrid output (DOM nodes rasterized, only SVG structure exported)
- **Edges Issue**: Pure SVG export not possible; edges render as part of DOM canvas
- **Alternative**: `dom-to-svg` library resolves this, produces cleaner SVG
- **File Size**: Risk of ~20MB vs 400KB PNG if not optimized

### Resolution & DPI

- `pixelRatio` controls DPI scaling (1 = 96DPI, 2 = 192DPI)
- For print: use `pixelRatio: 2-3`
- Mobile: check `window.devicePixelRatio`

### Viewport Handling

- Use `getNodesBounds()` + `getViewportForBounds()` to calculate optimal framing
- Parameters: (nodesBounds, targetWidth, targetHeight, minZoom, maxZoom)
- Ensures all nodes fit in export bounds

---

## 3. USER EXPERIENCE

### Export Button Placement

**Recommended Options:**

1. **Panel Component** (official): `<Panel position="top-right">`
2. **Controls Component**: Integrate with existing flow controls
3. **Toolbar**: Dedicated export toolbar above canvas
4. **Context Menu**: Right-click export option

### Loading States

```typescript
const [isExporting, setIsExporting] = useState(false);

const onClick = async () => {
  setIsExporting(true);
  try {
    const dataUrl = await toPng(viewport, options);
    downloadImage(dataUrl);
  } finally {
    setIsExporting(false);
  }
};

return <button disabled={isExporting}>{isExporting ? 'Exporting...' : 'Export'}</button>;
```

### File Naming Conventions

```typescript
const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const filename = `workflow-${timestamp}-${Math.random().toString(36).slice(2, 7)}.png`;
```

### Download Progress

- `html-to-image` operations are synchronous; no progress events
- For UX: show spinner for 500-2000ms during export
- Large diagrams: consider `setTimeout` delay before export

### Filtering UI Elements

```typescript
const filter = (node) => {
  const classList = node?.classList || {};
  return !(
    classList.contains('react-flow__minimap') ||
    classList.contains('react-flow__controls') ||
    classList.contains('react-flow__attribution') ||
    node?.tagName === 'BUTTON' // Exclude buttons/labels
  );
};

toPng(viewport, { filter }).then(downloadImage);
```

---

## 4. KEY TECHNICAL DETAILS

### html-to-image Options

| Option            | Type         | Default        | Purpose                                  |
| ----------------- | ------------ | -------------- | ---------------------------------------- |
| `filter`          | Function     | undefined      | Include/exclude nodes by classList check |
| `backgroundColor` | String       | "white"        | CSS color for background                 |
| `width`           | Number       | element width  | Override element width                   |
| `height`          | Number       | element height | Override element height                  |
| `style`           | Object       | undefined      | Inline styles (transform, scale)         |
| `cacheBust`       | Boolean      | false          | Append timestamp to prevent caching      |
| `quality`         | Number (0-1) | 1.0            | JPEG quality (ignored for PNG)           |
| `pixelRatio`      | Number       | 1              | DPI scaling (1=96DPI, 2=192DPI)          |
| `fontEmbedCSS`    | String       | undefined      | Pre-embedded font CSS to skip parsing    |

### Version Lock

- **Locked to v1.11.11** for React Flow compatibility
- Recent versions (>1.11.11) have export bugs; avoid upgrading without testing

### Known Issues

1. **Edges outside viewport**: May get clipped; use viewport transform utilities
2. **Cross-origin images**: CORS required; use `crossorigin` attribute
3. **Custom fonts**: Ensure fonts are web-safe or embedded
4. **External URLs**: Requires network request; can slow export

---

## 5. IMPLEMENTATION PATTERNS

### Pattern 1: Simple Single-Button Export

```typescript
import { useRef } from 'react';
import { toPng } from 'html-to-image';

const FlowExportButton = () => {
  const flowRef = useRef(null);

  const handleExport = () => {
    toPng(flowRef.current, {
      filter: n => !n?.classList?.contains('react-flow__controls'),
    }).then(url => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-${Date.now()}.png`;
      a.click();
    });
  };

  return <button onClick={handleExport}>Export to PNG</button>;
};
```

### Pattern 2: Format Selection with Quality Control

```typescript
const handleExport = async (format: 'png' | 'jpeg' | 'svg') => {
  const element = document.querySelector('.react-flow__viewport');

  const options = {
    backgroundColor: '#ffffff',
    filter: filterUIElements,
  };

  let dataUrl: string;

  switch (format) {
    case 'png':
      dataUrl = await toPng(element, options);
      break;
    case 'jpeg':
      dataUrl = await toJpeg(element, { ...options, quality: 0.9 });
      break;
    case 'svg':
      dataUrl = await toSvg(element, options);
      break;
  }

  downloadImage(dataUrl, `workflow.${format}`);
};
```

### Pattern 3: Fit-and-Export (Full Diagram)

```typescript
const handleExportFull = () => {
  fitView(); // Adjust viewport to show all nodes

  setTimeout(async () => {
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(nodesBounds, 1024, 768, 0.5, 2);

    const dataUrl = await toPng(document.querySelector('.react-flow__viewport'), {
      width: 1024,
      height: 768,
      style: {
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    });

    downloadImage(dataUrl, 'workflow-full.png');
  }, 300); // Wait for fitView animation
};
```

---

## 6. TRADE-OFFS & ALTERNATIVES

### PNG vs JPEG vs SVG

| Format | Quality             | Size   | Print | Scaling            | Use Case                   |
| ------ | ------------------- | ------ | ----- | ------------------ | -------------------------- |
| PNG    | Lossless            | Large  | Good  | Vector only in SVG | Web viewing, archival      |
| JPEG   | Lossy               | Small  | Fair  | Raster only        | Quick previews, thumbnails |
| SVG    | Hybrid (DOM+raster) | Medium | Fair  | Limited            | Data portability           |

### Library Alternatives

- **html-to-image** (recommended): Fast, stable, 1.11.11 locked
- **dom-to-svg**: Better SVG output, heavier, alternative for pure SVG needs
- **html2canvas**: Slower, heavier, CSS compatibility issues, not recommended
- **Native Canvas**: Complex DOM-to-canvas conversion, limited browser support

---

## 7. RECOMMENDED APPROACH FOR BEQEEK

1. **Use `html-to-image@1.11.11`** - Official, tested with XYFlow
2. **Default to PNG** - Best quality/size trade-off
3. **Implement filter** - Exclude minimap, controls, labels
4. **Add loading state** - Minimum 300ms visual feedback
5. **Button in Panel** - Follow React Flow UI conventions
6. **Include timestamp** - Prevent filename collisions
7. **Optional JPEG** - For mobile exports (smaller files)
8. **SVG future**: Consider `dom-to-svg` if pure SVG needed

---

## Code Files to Reference

- React Flow example: `/packages/@xyflow/react/examples/misc/download-image/`
- html-to-image docs: https://github.com/bubkoo/html-to-image

## Unresolved Questions

1. Should Beqeek support user-configurable DPI for print? (Not urgent MVP feature)
2. Should PDF export be phase 2? (Currently no native support; requires SVG→PDF conversion)
3. Should export include node data as metadata? (Consider for audit trail)
