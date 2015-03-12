var async = require('async');

module.exports = function(pages){
	var p = pages;

	p = p.filter(function(pg){
		return pg !== undefined;
	});

	if(!p.length) return false;

	var page = {
		url:pages[0].url,
		title: pages[0].title,
		ref: pages[0].ref,
		sprays: []
	}
	var map = {}

	p.forEach(function(p){
		page.sprays = page.sprays.concat(p.sprays);
	})

	page.sprays.forEach(function(s,i){
		console.log(i);
		var txt = s.targetText.split(' ').join('').toString();
		if(typeof(map[txt]) === "undefined"){
			map[txt] = i;
			page.sprays[i] = [s];
		}
		else{
			console.log('FOUND');
			if(page.sprays[map[txt]].length > 0){
				console.log('ITS AN ARRAY');
				//It's an array, add to it.
				page.sprays[map[txt]].push(s);
				// page.sprays.splice(i,1);
			}
			else{
				console.log('ITS NOT AN ARRAY');
				//Not an array, make it an array and push spray to it.
				var tmp = page.sprays[map[txt]]
				page.sprays[map[txt]] = [tmp,s];
				// page.sprays.splice(i,1);
			}
		}
	})

	page.sprays = page.sprays.filter(function(s){
		return s.length > 0;
	});

	return page;

}