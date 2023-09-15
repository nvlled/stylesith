/// <reference lib="es2021.string" />
/**
 * Stylesith is a simple, barebones CSS-in-JS library.
 * The purpose is to allow scoped, grouped, inline CSS without
 * the need for additional tooling or syntax. This library is intended
 * for server-rendered pages, but it's possible to use it on client-side
 * as well.
 *
 * @example
 * ```tsx
 * const boxCSS = createCSS({ scopeName: "box" });
 *
 * function Box({ label, color }: { color: string; label: string }) {
 *   // using css as the variable name allows formatting
 *   // and syntax highlighting for some editors
 *   const css = boxCSS;
 *
 *   // #x is the placeholder ID, it will be replaced by the actual generated ID *
 *   return (
 *     <div id={css.id} style={{ backgroundColor: color }}>
 *       <div className="label">{label}</div>
 *       {css`
 *         #x {
 *           display: flex;
 *           align-items: center;
 *           justify-content: center;
 *           margin: 5px;
 *           border: 1px solid black;
 *           width: 100px;
 *           height: 100px;
 *         }
 *         #x .label {
 *           color: #0ff;
 *         }
 *       `}
 *     </div>
 *   );
 * }
 * ```
 *
 * @module
 */

export interface StyleSith {
  getAllCSS(): string;
  clearCSS(): void;
  removeCSS(cssID: string): void;
  createCSS(options?: Options): CSS;
  onChange(fn: (event: ChangeEvent) => void): RemoveEventHandler;
}

export type WithCSSFunc = (css: CSS) => string | null;

export interface Options {
  scopeName?: string;
  placeholder?: string;
}

export interface CSS {
  (strings: TemplateStringsArray, ...args: (string | number)[]): string | null;
  id: string;
}

export interface Options {
  idPrefix?: string;
  scopeName?: string;
  placeholder?: string;
}

export interface ChangeEvent {
  id?: string;
  css?: string;
  type: "add" | "remove" | "clear";
}

export type ChangeEventHandler = (event: ChangeEvent) => void;
export type RemoveEventHandler = () => void;

// TODO: show example of how IDS are generated based on example
export const defaultOptions: Required<Options> = {
  idPrefix: "sith__",
  scopeName: "component",
  placeholder: "#x",
};

export function createInstance(defaults: Options = {}): StyleSith {
  const options = { ...defaults, ...defaultOptions };
  const styles: Record<string, string> = {};
  const listeners = new Set<ChangeEventHandler>();
  const counters: Record<string, number> = {};
  const self: StyleSith = {
    getAllCSS: function (): string {
      return Object.values(styles).join(" ");
    },

    removeCSS(cssID: string) {
      delete styles[cssID];
      dispatchChange("remove", cssID);
    },

    clearCSS() {
      for (const k of Object.keys(styles)) {
        delete styles[k];
      }
      dispatchChange("clear");
    },

    createCSS({
      idPrefix = options.idPrefix,
      scopeName = options.scopeName,
      placeholder = options.placeholder,
    }: Options = {}): CSS {
      const id = nextID(idPrefix, scopeName);

      const css: CSS = (
        strings: TemplateStringsArray,
        ...args: (string | number)[]
      ): null => {
        let result = styles[id];

        if (!result) {
          const values: string[] = [];
          for (let i = 0; i < strings.raw.length; i++) {
            values.push(strings.raw[i]);
            if (args[i]) values.push(args[i].toString());
          }
          result = values
            .join("")
            .replaceAll(placeholder, "#" + id)
            .replaceAll(/\s+/g, " ")
            .trim();

          styles[id] = result;
          dispatchChange("add", id, result);
        }

        return null;
      };

      css.id = id;
      return css;
    },

    onChange: function (fn: ChangeEventHandler): () => void {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };

  function dispatchChange(
    type: ChangeEvent["type"],
    id?: string,
    css?: string
  ) {
    const event = {
      id,
      css,
      type,
    };
    for (const fn of listeners) {
      fn(event);
    }
  }

  function nextID(idPrefix: string, scopeName: string) {
    const count = (counters[scopeName] ?? 0) + 1;
    const id = idPrefix + scopeName + (count === 1 ? "" : count).toString();
    counters[scopeName] = count;
    return id;
  }

  return self;
}

const defaultSith = createInstance();

export const getAllCSS = defaultSith.getAllCSS;
export const clearCSS = defaultSith.clearCSS;
export const createCSS = defaultSith.createCSS;
export const removeCSS = defaultSith.removeCSS;

export function inlineCSS(strings: TemplateStringsArray) {
  return strings.raw.join("");
}
