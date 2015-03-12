'use strict';

var _ = require('lodash');
var async = require('async');
var merge = require('../../components/mergePages');
var Page = require('./page.model');
var Spray = require('../spray/spray.model');
var Comment = require('../comment/comment.model.js');
var Organization = require('../organization/organization.model.js');

// Get list of pages
exports.index = function(req, res) {
    console.log(req.params);
    Page.find(function(err, pages) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, pages);
    });
};

function Aggregator(ref, _id) {
    return function(callback) {
        Page.findOne({
                name: (ref + ':' + _id)
            })
            .deepPopulate('sprays.comments')
            .exec(function(err, page) {
                if (err) return callback(err);
                if (!page) return callback(null)
                callback(null, page);
            })
    }
}

exports.mergeGroups = function(req, res) {
    console.log(req.body);
    var foundPage = false;
    var ref = req.params.page_ref;
    console.log('finding page, merging groups')
    if (!req.body['_ids[]']) res.send(404);
    var _ids = typeof(req.body['_ids[]']) === 'string' ? [req.body['_ids[]']] : req.body['_ids[]'];
    var functions = _ids.map(function(_id) {
        return new Aggregator(ref, _id);
    })
    async.parallel(functions, function(err, results) {
        console.log('!!!!!!!!!!');
        if (err) return handleError(res, err);
        var p = merge(results);
        console.log(p);
        if (!p) return res.send(404);
        res.json(p);
    })
}

// Get a single page
exports.show = function(req, res) {
    var foundPage = false;
    console.log('getting page');
    Organization.findById(req.params.org_id)
        .populate('pages')
        .exec(function(err, organization) {
            if (!organization) return res.send(404);
            if (organization.pages.length === 0) return res.send(404);
            organization.pages.forEach(function(page, index) {
                if (page.ref === req.params.page_ref) {
                    foundPage = true;
                    Page.findOneAndUpdate({
                            _id: page._id
                        }, {
                            page_ref: req.params.page_ref
                        }, {
                            upsert: true
                        })
                        .deepPopulate('sprays.comments')
                        .exec(function(err, page) {
                            if (err) {
                                return handleError(res, err);
                            }
                            if (!page) {
                                return res.json({});
                            }
                            return res.json(page)
                        })
                }
                // if(index === organization.pages.length -1) return res.send(404);
            });
        });
};

function createMultiple(_id, name, body) {
    return function(callback) {
        Organization.findById(_id, function(err, organization) {
            if (err) return callback(err);
            if (!organization) {
                return callback(null);
            }
            Page.create({
                url: body.url,
                title: body.title,
                name: body.ref + ':' + organization._id,
                ref: body.ref
            }, function(err, page) {
                organization.pages.push(page._id);
                organization.save();

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
                            Page.findById(page._id)
                                .deepPopulate('sprays.comments')
                                .exec(function(err, page) {
                                    if (err) {
                                        return callback(err);
                                    }
                                    if (!page) {
                                        return callback(null, {})
                                    }
                                    return callback(null, page);
                              })
                        });
                    })
                })
            });
        })
    }
}

exports.create = function(req, res) {
    console.log(req.body);
    var _ids = typeof(req.body['_ids[]']) === 'string' ? [req.body['_ids[]']] : req.body['_ids[]'];
    var names = typeof(req.body['names[]']) === 'string' ? [req.body['names[]']] : req.body['names[]'];
    var functions = _ids.map(function(_id, index) {
        return new createMultiple(_id, names[index], req.body);
    })

    async.parallel(functions,function(err,results){
    	console.log('!!!!!!!!!!');
    	if(err) return handleError(res, err);
    	var p = merge(results);
        console.log(p);
        if (!p) return res.send(404);
        res.json(p);
    })
}

// Updates an existing page in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Page.findById(req.params.id, function(err, page) {
        if (err) {
            return handleError(res, err);
        }
        if (!page) {
            return res.send(404);
        }
        var updated = _.merge(page, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, page);
        });
    });
};

// Deletes a page from the DB.
exports.destroy = function(req, res) {
    Page.findById(req.params.id, function(err, page) {
        if (err) {
            return handleError(res, err);
        }
        if (!page) {
            return res.send(404);
        }
        page.remove(function(err) {
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
