'use strict';

var _ = require('lodash');
var Comment = require('./comment.model');
var Spray = require('../spray/spray.model')

// Get list of comments
exports.index = function(req, res) {
    Comment.find(function(err, comments) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, comments);
    });
};

// Get a single comment
exports.show = function(req, res) {
    Comment.findById(req.params.id, function(err, comment) {
        if (err) {
            return handleError(res, err);
        }
        if (!comment) {
            return res.send(404);
        }
        return res.json(comment);
    });
};

// Creates a new comment in the DB.
exports.create = function(req, res) {
    console.log(req.body);
    Spray.findById(req.body.spray_id, function(err, spray) {
        console.log('FINDING SPRAY',arguments);
        var comment = new Comment({
            pageRef:spray.pageRef,
            user: req.body.user,
            text: req.body.text
        });
        comment.save(function(err, comment) {
            spray.comments.push(comment._id);
            spray.save(function(err, spray) {
                res.json(comment);
            })
        })
    })
};

// Updates an existing comment in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Comment.findById(req.params.id, function(err, comment) {
        if (err) {
            return handleError(res, err);
        }
        if (!comment) {
            return res.send(404);
        }
        var updated = _.merge(comment, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, comment);
        });
    });
};

// Deletes a comment from the DB.
exports.destroy = function(req, res) {
    Comment.findById(req.params.id, function(err, comment) {
        if (err) {
            return handleError(res, err);
        }
        if (!comment) {
            return res.send(404);
        }
        comment.remove(function(err) {
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
