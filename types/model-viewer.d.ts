import type React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          'ios-src'?: string;
          alt?: string;
          ar?: boolean | string;
          'ar-modes'?: string;
          'ar-scale'?: string;
          'camera-controls'?: boolean | string;
          'auto-rotate'?: boolean | string;
          'touch-action'?: string;
          poster?: string;
          'shadow-intensity'?: string;
          exposure?: string;
          'environment-image'?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
