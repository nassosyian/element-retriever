/*
* @Author: Nassos
* @Date:   2016-08-24 22:54:34
* @Last Modified by:   Nassos
* @Last Modified time: 2016-09-04 18:44:42
*/

var xhr = require('xhr');
var domify = require('domify');

/**
 * Makes an AJAX GET (default) call to retrieve the HTML given in the url parameter. Only runs on the browser
 * @param  {string or object}   url_or_options A url string or an xhr config object.
 * @param  {array of strings}   selectorList   an array of string selectors for use in querySelectorAll()
 * @param  {Function} callback       Called with (error, response, dict) arguments. 'dict' is a JS object acting as a dictionary with each selector from 'selectorList' being a property, with values an array of HtmlElements that have been matched.
 * @return {[type]}                  returns nothing.
 */
module.exports = function(url_or_options, selectorList, callback)
{
	if (!selectorList || selectorList.length==0)
		throw new Error('you must pass a list of css selectors for the elements you want to be returned.');

	if (!url_or_options)
		throw new Error('url or options must not be empty');

	if (!callback)
		throw new Error('callback must be a valid function of the form "function( error, response, element_dict_obj)"')

	function documentHtml(html) 
	{
		// Prepare
		var result = String(html)
			.replace(/<\!DOCTYPE[^>]*>/i, '')
			.replace(/<(html|head|body|title|meta|script)([\s\>])/gi,'<div class="_document-$1"$2')
			.replace(/<\/(html|head|body|title|meta|script)\>/gi,'</div>')
		;
		
		// Return
		return result;
	};

	var options;

	if (typeof url_or_options !== "string")
	{
		options = url_or_options;
		url_or_options = options.url || options.uri;
	}

	xhr.get(url_or_options, options, function( error, response , body)
		{
			var dict = {};


			if (!error && typeof body === "string")
			{
				var html = documentHtml(body);
				var data = domify(html);

				var re = /^(html|head|body|title|meta|script)$/;
				for (var i = 0; i < selectorList.length; i++)
				{
					var sel = selectorList[i];
					// var search = sel.test(/^(html|head|body|title|meta|script)$/);
					sel = (re.test(sel) ? "._document-"+sel : sel);

					var elList = data.querySelectorAll(sel);
					var htmlList = [];
					for (var j = 0; j < elList.length; j++)
					{
						htmlList.push( elList[j].outerHTML );
					}			

					dict[ selectorList[i] ] = htmlList;
				}
			}
			else
			{
				for (var i = 0; i < selectorList.length; i++)
				{
					dict[ selectorList[i] ] = [];
				}
			}
			callback(error, response, dict);
		});

};