var async = require('async');

module.exports = function(groups){
	var g = groups;

	if(!g.length) return false;

	var pages = [];
	var newPages = [];
	var map = {}

	g.forEach(function(group){
		pages = pages.concat(group.pages);
	})

	pages.forEach(function(p){
		var url = p.url;
		if(typeof(map[url]) === "undefined"){
			newPages.push(p);
			map[url] = newPages.length-1;
		}
		else{
				newPages[map[url]].sprays = newPages[map[url]].sprays.concat(p.sprays);
			}
		})

	newPages.sort(function(a,b){
		var aDate = new Date(a.updatedAt), bDate = new Date(b.updatedAt)
		return bDate.getTime() - aDate.getTime();
	})

	return newPages;

}