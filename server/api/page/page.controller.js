'use strict';

var _ = require('lodash');
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

// Get a single page
exports.show = function(req, res) {
    var foundPage = false;
    console.log('getting page');
    Organization.findById(req.params.org_id)
      .populate('pages')
      .exec(function(err,organization){
        if(!organization) return res.send(404);
        if(organization.pages.length === 0) return res.send(404);
        organization.pages.forEach(function(page,index){
          if(page.ref === req.params.page_ref){
            foundPage = true;
            Page.findById(page._id)
              .deepPopulate('sprays.comments')
              .exec(function(err,page){
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

// Creates a new page in the DB.
exports.create = function(req, res) {
  console.log(req.body);
  Organization.findById(req.body.org_id,function(err,organization){
  	if (!organization) {
            return res.send(404);
        }
    Page.create({
      name:req.body.ref+':'+organization._id,
      ref:req.body.ref
    },function(err,page){
      organization.pages.push(page._id);
      organization.save();

      var spray = new Spray({
        pageRef: page._id,
        targetText:req.body.targetText,
        p_index: req.body.p_index ? req.body.p_index : -1
      });

      var comment = new Comment({
        user: req.body.user,
        text: req.body.text,
        pageRef: page._id
      });

      comment.save(function(err,comment){
        spray.comments.push(comment._id);
        spray.save(function(err,spray){
          page.sprays.push(spray._id);
          page.save(function(err,page){
            return res.send(200);
          });
        })
      })
    });
  });
};

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
