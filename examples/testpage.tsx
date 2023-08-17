import { h, toString } from "https://deno.land/x/jsx_to_string@v0.5.0/mod.ts";
import { createCSS, getAllCSS } from "../mod.ts";

const containerCSS = createCSS({ scopeName: "container" });

function Container({ children }: { children: JSX.Children }) {
  const css = containerCSS;
  return (
    <div id={css.id}>
      {css`
        ## {
          width: 500px;
        }
        ## > header {
          color: red;
        }
        ## > footer {
        }
        ##-contents {
          display: flex;
          width: 500px;
        }
      `}
      <header>******</header>
      <div id={css.id + "-contents"}>{children}</div>
      <footer>%%%%%%</footer>
    </div>
  );
}

const boxCSS = createCSS({ scopeName: "box" });

// Box example component. This is the preferred method.
// See Circle component for the alternative.
// This method is more efficient and generates less CSS.
// The css result is only computed once.
// Note for the dynamic styling, the style attribute is used.
function Box({ label, color }: { color: string; label: string }) {
  const css = boxCSS;
  return (
    <div id={css.id} style={{ backgroundColor: color }}>
      <div className="label">{label}</div>
      {/* ## is the placeholder ID, it will be replaced by the actual generated ID */}
      {css`
        ## {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 5px;
          border: 1px solid black;
          width: 100px;
          height: 100px;
        }
        ## .label {
          color: #0ff;
        }
      `}
    </div>
  );
}

// Circle example component. Ideally for illustration purposes only.
// This will create duplicated CSS for each <Circle /> created.
function Circle({ label, color }: { color: string; label: string }) {
  const css = createCSS({ scopeName: "circle" });
  return (
    <div id={css.id}>
      <div className="label">{label}</div>
      {css`
        ## {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 5px;
          border: 1px solid black;
          background-color: ${color};
          border-radius: 50%;
          width: 100px;
          height: 100px;
        }
        ## .label {
          color: #0ff;
        }
      `}
    </div>
  );
}

const html = (
  <html>
    <head>
      {/* The <style /> will render last after all other elements have been stringified. 
          This is to make sure getAllCSS() has all the CSS. It is done by
          by wrapping it with `() => `. This feature is particular to jsx_to_string library.
          Other option include modifying the node tree and appending the style before rendering
          to string. */}
      {() => <style dangerouslySetInnerHTML={{ __html: getAllCSS() }} />}
    </head>
    <body>
      <Container>
        <Box label="A" color="red" />
        <Box label="B" color="blue" />
        <Box label="C" color="green" />
      </Container>
      <Container>
        <Circle label="A" color="red" />
        <Circle label="B" color="blue" />
        <Circle label="C" color="green" />
      </Container>
    </body>
  </html>
);

// See output by running `$ deno run testpage.tsx`
// Alternatively, see testpage-formatted-output.html
console.log(toString(html));
