'use strict';

var _ = require('lodash');
var Organization = require('../organization/organization.model');
var Page = require('../page/page.model');
var Spray = require('./spray.model');
var Comment = require('../comment/comment.model');
var async = require('async');

// Get list of sprays
exports.index = function(req, res) {
    Spray.find(function(err, sprays) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, sprays);
    });
};

// Get a single spray
exports.show = function(req, res) {
    Spray.findById(req.params.id)
        .populate('comments')
        .exec(function(err, spray) {
            if (err) {
                return handleError(res, err);
            }
            if (!spray) {
                return res.send(404);
            }
            return res.json(spray);
        });
};

var createMultiple = function (_id, name, body) {
	return function(callback) {
        Organization.findById(_id, function(err, organization) {
            if (err) return callback(err);
            if (!organization) {
                return callback(null);
            }
            Page.findOneAndUpdate({
                name: body.ref+':'+organization._id,
            },{
                url: body.url,
                title: body.title,
                name: body.ref + ':' + organization._id,
                ref: body.ref
            },
            {upsert:true}, function(err, page) {
            		console.log(err);
            		console.log(page);
                var spray = new Spray({
                		org_id:organization._id,
                    pageRef: page._id,
                    targetText: body.targetText,
                    p_index: body.p_index ? body.p_index : -1
                });

                var comment = new Comment({
                    user: name,
                    text: body.text,
                    pageRef: page._id
                });

                comment.save(function(err, comment) {
                    spray.comments.push(comment._id);
                    spray.save(function(err, spray) {
                        page.sprays.push(spray._id);
                        page.save(function(err, page) {
	                        if (err) {
	                            return callback(err);
	                        }
	                        if (!page) {
	                            return callback(null)
	                        }
	                        Spray.findById(spray._id)
	                        .populate('comments')
	                        .exec(function(err,spray){
	                        	if (err) {
	                            return callback(err);
	                        	}
	                        	return callback(null, spray);
	                        })
                    })
                })
            });
        })
    })
	}
}

// Creates a new spray in the DB.
exports.create = function(req, res) {

		console.log(req.body);
    var _ids = typeof(req.body['_ids[]']) === 'string' ? [req.body['_ids[]']] : req.body['_ids[]'];
    var names = typeof(req.body['names[]']) === 'string' ? [req.body['names[]']] : req.body['names[]'];
    var functions = _ids.map(function(_id, index) {
        return new createMultiple(_id, names[index], req.body);
    })

    async.parallel(functions,function(err,results){
    	console.log('!!!!!!!!!!');
    	console.log(err);
    	if(err) return handleError(res, err);
    	var p = results;
        console.log(p);
        if (!p) return res.send(404);
        res.json(p);
        // res.send(200);
    });
};

// Updates an existing spray in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Spray.findById(req.params.id, function(err, spray) {
        if (err) {
            return handleError(res, err);
        }
        if (!spray) {
            return res.send(404);
        }
        var updated = _.merge(spray, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, spray);
        });
    });
};

// Deletes a spray from the DB.
exports.destroy = function(req, res) {
    Spray.findById(req.params.id, function(err, spray) {
        if (err) {
            return handleError(res, err);
        }
        if (!spray) {
            return res.send(404);
        }
        spray.remove(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}
