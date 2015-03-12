'use strict';

var _ = require('lodash');
var async = require('async');
var Organization = require('./organization.model');

var Spray = require('../spray/spray.model');
var Comment = require('../comment/comment.model.js');

var mergeFeed = require('../../components/mergeFeed');

// Get list of organizations
exports.index = function(req, res) {
	if(req.query.public){
		Organization.find({publicViewable:true}, function(err, organizations) {
    	if(err) { return handleError(res, err); }
   	 return res.json(200, organizations);
  	});
	}
	else{
		 Organization.find(function (err, organizations) {
    	if(err) { return handleError(res, err); }
   	 return res.json(200, organizations);
  	});
	}
};

// Get a single organization
exports.show = function(req, res) {
  Organization.findById(req.params.id, function (err, organization) {
    if(err) { return handleError(res, err); }
    if(!organization) { return res.send(404); }
    return res.json(organization);
  });
};

exports.getFeed = function(req,res){
  if(!req.body['_ids[]']) res.send(404);
  var _ids = typeof(req.body['_ids[]']) === 'string' ? [req.body['_ids[]']] : req.body['_ids[]'];
  Organization.find({
    '_id': { $in: _ids}
  }).populate({
  path: 'pages',
  select: 'ref sprays url title updatedAt',
  options: { limit: 5 }
}).exec(function(err,orgs){
    if(err) { return handleError(res, err); }
    var f = mergeFeed(orgs);
	  console.log(f);
	  if (!f) return res.send(404);
	  res.json(f);
  })
};

// Get a single organization
exports.findByCode = function(req, res) {
  var found = false;
  Organization.find(function (err, organizations) {
    if(err) { return handleError(res, err); }
    if(!organizations) { return res.send(404); }
    organizations.forEach(function(organization,index){
      var id = organization._id.toString();
      console.log(id.substr(id.length-4),req.params.id);
      if(id.substr(id.length-4) === req.params.id){
        found = true;
        return res.json(organization);
      }
      if(index === organizations.length -1 && found === false) return res.send(404);
    });
  });
};

// Creates a new organization in the DB.
exports.create = function(req, res) {
  Organization.create(req.body, function(err, organization) {
    if(err) { return handleError(res, err); }
    return res.json(201, organization);
  });
};

// Updates an existing organization in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Organization.findById(req.params.id, function (err, organization) {
    if (err) { return handleError(res, err); }
    if(!organization) { return res.send(404); }
    var updated = _.merge(organization, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, organization);
    });
  });
};

// Deletes a organization from the DB.
exports.destroy = function(req, res) {
  Organization.findById(req.params.id, function (err, organization) {
    if(err) { return handleError(res, err); }
    if(!organization) { return res.send(404); }
    organization.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
