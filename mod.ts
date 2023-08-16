/// <reference lib="es2021.string" />

export interface StyleSith {
  styles: string[];
  getAllCSS(): string;
  createCSS(options: CreateCSSOptions): CSS;
}

export interface CSS {
  (strings: TemplateStringsArray, ...args: (string | number)[]): string | null;
  id: string;
  creator?: StyleSith;
}

const defaultScope = "component";
const defaultPlaceholder = "##";
const defaultSith = createInstance();

export interface CreateCSSOptions {
  scopeName?: string;
  placeholder?: string;
  once?: boolean;
  defer?: boolean;
}

export function createInstance(defaults: CreateCSSOptions = {}): StyleSith {
  const self: StyleSith = {
    styles: [],
    getAllCSS: function (): string {
      return self.styles.join(" ");
    },
    createCSS(options: CreateCSSOptions = {}): CSS {
      options.placeholder ??= defaults.placeholder;
      options.defer ??= defaults.defer;
      const css = createCSS(options);
      css.creator = self;
      return css;
    },
  };
  return self;
}

export interface CreateCSSOptions {
  scopeName?: string;
  placeholder?: string;
  once?: boolean;
  defer?: boolean;
}

const counters: Record<string, number> = {};

export function createCSS({
  scopeName: scope = defaultScope,
  placeholder = defaultPlaceholder,
  once = false,
  defer = false,
}: CreateCSSOptions = {}): CSS {
  const count = (counters[scope] ?? 0) + 1;
  const id = scope + "__" + count;
  counters[scope] = count;

  let lastResult: string | undefined;
  const css: CSS = (
    strings: TemplateStringsArray,
    ...args: (string | number)[]
  ) => {
    const values: string[] = [];
    for (let i = 0; i < strings.raw.length; i++) {
      values.push(strings.raw[i]);
      if (args[i]) values.push(args[i].toString());
    }

    const result =
      once && lastResult !== undefined
        ? lastResult
        : values
            .join("")
            .replaceAll(placeholder, "#" + id)
            .replaceAll(/\s+/g, "");

    lastResult = result;

    if (defer) {
      if (css.creator) css.creator.styles.push(result);
      return null;
    }

    return result;
  };

  css.creator = defaultSith;
  css.id = id;

  return css;
}

export function getAllCSS() {
  return defaultSith.getAllCSS();
}

export const css = createCSS({ defer: false, once: false });
