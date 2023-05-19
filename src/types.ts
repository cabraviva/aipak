export interface Arguments {
    // deno-lint-ignore no-explicit-any
    [x: string]: any;
    _: (string | number)[];
}

export type strnum = string | number