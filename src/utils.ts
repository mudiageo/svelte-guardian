import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
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
