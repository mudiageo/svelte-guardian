import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}
 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any }
 ? Omit<T, "children">
 : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
 ref?: U | null;
};

/**
  * Returns code with curly braces and backticks replaced by HTML entity equivalents
  * @param {string} html - highlighted HTML
  * @returns {string} - escaped HTML
  */
 export const escapeHtml = code => {
   return code.replace(
     /[{}`]/g,
     (character) => ({ '{': '&lbrace;', '}': '&rbrace;', '`': '&grave;' }[character]),
   );
 }
 
/**
 * Returns code with HTML entity equivalents replaced by original characters
 * @param {string} escapedHtml - escaped HTML
 * @returns {string} - original HTML
 */
export const  unescapeHtml = escapedHtml => {
  return escapedHtml.replace(/&lbrace;|&rbrace;|&grave;/g, (entity) => ({
    '&lbrace;': '{',
    '&rbrace;': '}',
    '&grave;': '`'
  }[entity]));
}
