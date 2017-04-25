var getHtmlTranslationTable = require('./get_html_translation_table');

module.export = function html_entity_decode (string, quoteStyle) {
  var tmpStr = '';
  var entity = '';
  var symbol = '';

  tmpStr = string.toString();

  var hashMap = getHtmlTranslationTable('HTML_ENTITIES', quoteStyle);

  if (hashMap === false) {
    return false;
  }

  delete (hashMap['&']);

  hashMap['&'] = '&amp;';

  for (symbol in hashMap) {
    entity = hashMap[symbol];
    tmpStr = tmpStr.split(entity).join(symbol);
  }

  tmpStr = tmpStr.split('&#039;').join("'");
  
  return tmpStr;
}