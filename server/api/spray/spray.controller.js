'use strict';

var _ = require('lodash');
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
            console.log(spray);
            return res.json(spray);
        });
};

// Creates a new spray in the DB.
exports.create = function(req, res) {
    console.log('SPRAY CREATE', req.body);
    Page.findById(req.body.page_id, function(err, page) {
        var spray,comment;

        async.series([function(callback){
          spray = new Spray({
            targetText: req.body.targetText,
            pageRef: page._id,
            p_index:req.body.p_index ? req.body.p_index : -1
          });
          callback();
        },function(callback){
          comment = new Comment({
            user: req.body.user,
            text: req.body.text,
            pageRef: page._id
          });
          callback();
        },function(callback){
          comment.save(function(err,comment){
            spray.comments.push(comment._id);
            spray.markModified('comments');
            callback();
          })
        },function(callback){
          page.sprays.push(spray._id);
          page.markModified('sprays');
          page.save(function(err,page){
            callback();
          })
        },function(callback){
          spray.save(function(err,spray){
            callback();
          })
        }],
        function(err,results){
          console.log('CREATING SPRAY');
          return res.send(200);
        });


        //Comment.create({
        //    user: req.body.user,
        //    text: req.body.text,
        //    pageRef: page._id
        //}, function(err, comment) {
        //		console.log(arguments);
        //    spray.comments.push(comment._id);
        //    spray.save(function(err, spray) {
        //        page.sprays.push(spray._id);
        //        page.save(function(err, page) {
        //            Page.findById(page._id)
        //                .deepPopulate('sprays.comments')
        //                .exec(function(err, page) {
        //                    return res.json(page);
        //                })
        //        })
        //    })
        //})
    })
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
