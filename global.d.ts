import React from 'react';

declare global {
  namespace JSX {
    type ElementType = React.JSX.ElementType;
    type Element = React.JSX.Element;
    type ElementClass = React.JSX.ElementClass;
    type ElementAttributesProperty = React.JSX.ElementAttributesProperty;
    type ElementChildrenAttribute = React.JSX.ElementChildrenAttribute;
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
    type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
    type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>;

    // Fallback any string key to any to prevent strict JSX missing element errors
    // while keeping autocomplete for known tags via React.JSX.IntrinsicElements
    interface IntrinsicElements extends React.JSX.IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
