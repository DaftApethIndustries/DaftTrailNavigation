/*jslint evil: false, jquery:true, forin: true, white: false, devel:true */
/*!
 * Daft Trail navigation
 * Author: ryanand26 (2014) (http://www.daftapeth.co.uk)
 * @version 0.1
**/

(function ($) {
	var defaults = {
			breadcrumbSelect: '.breadcrumb',
			storageKey: 'trailnav',
			max: 4,
			enabled: true
		},
		settings,
		visited = [];

	/**
	* Get data from storage
	*/
	function getData() {
		var data = sessionStorage.getItem(settings.storageKey);

		if (data) {
			visited = $.parseJSON(data);
		}
		return data;
	}

	/**
	* Set data in storage
	*/
	function setData() {
		var data = JSON.stringify(visited);
		sessionStorage.setItem(settings.storageKey, data);
	}

	/**
	* Search for a given path/name in the list of visited locations
	*/
	function find(path, name) {
		var i, iLen = visited.length;

		for (i = 0; i < iLen; i += 1) {
			if (visited[i].path === path || visited[i].name === name) {
				return i;
			}
		}
		return -1;
	}

	/**
	* Setter for trail
	*/
	function setHistory(path, name) {
		//test for pre-existing
		var existsAtIndex = find(path, name);

		if (existsAtIndex !== -1) {
			//remove the items that follow this item
			visited.splice(existsAtIndex + 1, visited.length);
		}
		else {
			if (visited.length === settings.max) {
				visited.shift();
			}
			//add the new item
			visited.push({
				'path' : path,
				'name' : name
			});
		}
		setData();
	}

	/**
	* Add current location
	*/
	function addCurrentPage() {
		var thisHref = window.location.href,
			titleSource = $('h1'),
			thisTitle;

		if (titleSource.length === 0) {
			titleSource = $('title');
		}

		thisTitle = titleSource.eq(0).text();

		setHistory(thisHref, thisTitle);
	}

	/**
	* Update the UI with the data
	*/
	function updateUI(container) {
		var linkPattern = '<li><a href="%path%">%name%</a></li>',
			spanPattern = '<li><span>%name%</span></li>',
			htmlString = '',
			activePattern = linkPattern,
			existingFirstLink, existingFirstLinkHref,
			i, iLen = visited.length;

		existingFirstLink = container.find('li').eq(0).find('a');
		existingFirstLinkHref = existingFirstLink[0].href;

		for (i = 0; i < iLen; i += 1) {
			//last item is not a link
			if (i === iLen - 1) {
				activePattern = spanPattern;
			}
			//if this item matches the current root
			if (visited[i].path === existingFirstLinkHref) {
				//use the existing HTML information
				htmlString += activePattern.replace('%path%', existingFirstLinkHref).replace('%name%', existingFirstLink.html());
			}
			else {
				htmlString += activePattern.replace('%path%', visited[i].path).replace('%name%', visited[i].name);
			}
		}
		container.html(htmlString);
	}

	/**
	* Init
	*/
	function init(options) {
		var container;
		
		settings = $.extend({}, defaults, options);

		//only run if the tech is supported
		if (JSON && JSON.stringify && sessionStorage) {
			getData();

			//add current location
			addCurrentPage();

			container = $(settings.breadcrumbSelect);
			if (container.length > 0 && visited.length > 1) {
				updateUI(container);
			}
		}
	}

})(jQuery);