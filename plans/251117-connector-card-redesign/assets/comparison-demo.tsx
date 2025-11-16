/**
 * Connector Card Design Comparison Demo
 *
 * Side-by-side comparison of original vs compact design
 * This file is for demonstration only - not part of the application
 */

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Text, Heading } from '@workspace/ui/components/typography';

// Sample connector data
const sampleConnector = {
  type: 'SMTP',
  name: 'SMTP',
  description: 'Kết nối với máy chủ SMTP để gửi email.',
  logo: '/images/email.png',
};

/**
 * Original Design (Centered, Vertical)
 * Height: ~160px
 */
function ConnectorCardOriginal() {
  return (
    <Card className="hover:shadow-md hover:scale-[1.01] hover:border-primary/40 transition-all cursor-pointer border-border/60">
      <CardContent className="p-4 space-y-3 text-center">
        {/* Logo - Compact */}
        <div className="flex justify-center">
          <img src={sampleConnector.logo} alt={sampleConnector.name} className="size-12 object-contain rounded-lg" />
        </div>

        {/* Name - Smaller heading */}
        <Heading level={4} className="text-center">
          {sampleConnector.name}
        </Heading>

        {/* Description - Compact, 2 lines max */}
        <Text size="small" color="muted" className="line-clamp-2">
          {sampleConnector.description}
        </Text>
      </CardContent>
    </Card>
  );
}

/**
 * Compact Design (Horizontal, Left-aligned)
 * Height: 88px (45% reduction)
 */
function ConnectorCardCompact() {
  return (
    <Card className="hover:shadow-md hover:border-primary/40 hover:bg-accent/20 transition-all duration-200 cursor-pointer border-border/60">
      <CardContent className="px-4 py-3 p-0">
        <div className="flex items-start gap-3">
          {/* Icon Container */}
          <div className="flex-shrink-0">
            <img src={sampleConnector.logo} alt={sampleConnector.name} className="size-10 object-contain rounded-lg" />
          </div>

          {/* Content Container */}
          <div className="flex-1 min-w-0 space-y-1">
            <Heading level={4} className="text-base font-semibold leading-tight truncate">
              {sampleConnector.name}
            </Heading>

            <Text size="small" color="muted" className="line-clamp-2 leading-normal">
              {sampleConnector.description}
            </Text>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Comparison Demo Component
 */
export function ConnectorCardComparisonDemo() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Connector Card Redesign Comparison</h1>
        <p className="text-muted-foreground">Original (Centered, Vertical) vs Compact (Horizontal, Left-aligned)</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Original Design */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Original Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Height:</span>
                  <span className="font-semibold">~160px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Icon Size:</span>
                  <span className="font-semibold">48×48px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Layout:</span>
                  <span className="font-semibold">Vertical, Centered</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grid:</span>
                  <span className="font-semibold">3 columns</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-semibold">2 lines</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <ConnectorCardOriginal />

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-semibold">Issues:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Excessive whitespace (p-4 + space-y-3)</li>
              <li>Centered layout creates visual bloat</li>
              <li>3-column grid overcrowded</li>
              <li>Difficult to scan vertically</li>
            </ul>
          </div>
        </div>

        {/* Compact Design */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">Compact Design ★</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Height:</span>
                  <span className="font-semibold text-green-600">88px (-45%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Icon Size:</span>
                  <span className="font-semibold">40×40px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Layout:</span>
                  <span className="font-semibold">Horizontal, Left</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grid:</span>
                  <span className="font-semibold">2 columns</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-semibold">2 lines</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <ConnectorCardCompact />

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-semibold text-green-600 dark:text-green-400">Benefits:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>45% height reduction (160px → 88px)</li>
              <li>Faster horizontal scanning</li>
              <li>2-column grid prevents overcrowding</li>
              <li>Icon remains recognizable (40px)</li>
              <li>Maintains 2-line Vietnamese descriptions</li>
              <li>Better scannability and comparison</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Metric</th>
                  <th className="text-center py-2">Original</th>
                  <th className="text-center py-2">Compact</th>
                  <th className="text-center py-2">Improvement</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Card Height</td>
                  <td className="text-center">~160px</td>
                  <td className="text-center font-semibold text-green-600">88px</td>
                  <td className="text-center font-semibold text-green-600">-45%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Icon Size</td>
                  <td className="text-center">48×48px</td>
                  <td className="text-center">40×40px</td>
                  <td className="text-center text-yellow-600">-17%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Description Lines</td>
                  <td className="text-center">2 lines</td>
                  <td className="text-center">2 lines</td>
                  <td className="text-center">Same</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Grid Columns (Desktop)</td>
                  <td className="text-center">3</td>
                  <td className="text-center">2</td>
                  <td className="text-center text-blue-600">Better readability</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Scannability</td>
                  <td className="text-center">Vertical (slower)</td>
                  <td className="text-center font-semibold text-green-600">Horizontal (faster)</td>
                  <td className="text-center text-green-600">Improved</td>
                </tr>
                <tr>
                  <td className="py-2">Accessibility</td>
                  <td className="text-center">WCAG 2.1 AA</td>
                  <td className="text-center">WCAG 2.1 AA</td>
                  <td className="text-center">Same</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Grid Comparison */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Grid Layout Comparison</h2>

        <div className="space-y-6">
          {/* Original 3-column */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Original: 3 Columns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ConnectorCardOriginal />
              <ConnectorCardOriginal />
              <ConnectorCardOriginal />
            </div>
          </div>

          {/* Compact 2-column */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">Compact: 2 Columns ★</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ConnectorCardCompact />
              <ConnectorCardCompact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
