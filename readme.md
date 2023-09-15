# stylesith

This library is a simple, barebones CSS-in-JS library.
The purpose is to allow scoped, grouped, inline CSS without
the need for additional tooling or syntax. This library is intended
for server-rendered JSX pages, but it's possible to use it on client-side
as well.

Basically, stylesith is just doing a regex-replace for the placeholders with
a generated ID, and then concating all the created CSS created into one string.
But this simple abstraction makes it on par feature-wise (I think) with the
other complex CSS-in-JS libraries.

It is left as an exercise for the reader to ponder
whether there's a typo in the library name.

```tsx
import { createCSS } from "https://deno.land/x/stylesith/mod.ts";
const css = createCSS()

<div id={css.id} style={{ backgroundColor: color }}>
  <div className="label">{label}</div>
  {css`
    #x {
      display: flex;
      align-items: center;
      margin: 5px;
      border: 1px solid black;
    }
    #x .label {
      color: #0ff;
    }
  `}
</div>;
```

## Why not just use a plain CSS?

One reason is that CSS are global and not scoped by default.
Making sure an id or className is unique and doesn't
clash accidentally is tedious and error-prone.

Another reason is lack of locality when using a separate CSS file.
Grouping related and tightly-coupled together makes it
easier to reason and modify code. A <style> can avoid
creating separate files, but it still has the problem
of not being scoped by default. And when using JSX components,
embedding these styles directly inside the component could
possibly result in a larger generated HTML output.

## Why not just use the inline style attribute: <div style="...">?

Inline styles are quite limited in that it doesn't allow
more sophisticated selectors, and it's possible also to generate
quite a large HTML page output if more complex inline styles
are created with components.

## Examples

See `testpage.tsx` and `testpage-formatted-output.html`

## TODO

- add more documentation
- add installation instructions
- generate npm package
