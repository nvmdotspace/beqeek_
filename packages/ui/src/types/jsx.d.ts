/**
 * JSX type declarations for primitives
 */

/// <reference types="react" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
