// My custom trim method
import { htmlToText } from 'html-to-text';

export function htmlToTextTrimWithEllipses(str, trimLength) {
  // function htmlToTextTrimWithEllipses(str, trimLength) {

  let trimmedStr = htmlToText(str, {
    tags: {
      'a': { options: { ignoreHref: true } }, // to ignore href/urls
      'img': { format: 'skip' }, // to ignore images
      'h1': { options: { uppercase: true } },
      'table': { options: { uppercaseHeaderCells: true } },
    }
  });

  if (trimmedStr.length <= trimLength) return trimmedStr;

  trimmedStr = trimmedStr.substr(0, 320).trim() + ' ...';

  // console.log("trimmedStr ==>", trimmedStr);

  return trimmedStr;
}

// htmlToTextTrimWithEllipses(str, 320);


// html trim method provided by Author
// ----------------------------------------------------------------

export function smartTrim(str, length, delim, appendix) {
  if (str.length <= length) return str;

  var trimmedStr = str.substr(0, length + delim.length);

  var lastDelimIndex = trimmedStr.lastIndexOf(delim);

  if (lastDelimIndex >= 0) trimmedStr = trimmedStr.substr(0, lastDelimIndex);

  if (trimmedStr) trimmedStr += appendix;

  return trimmedStr;
}