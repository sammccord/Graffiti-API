/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Spray = require('./spray.model');
var Page = require('../page/page.model');

exports.register = function(socket) {
  Spray.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Spray.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
};

function onSave(socket, doc, cb) {
  Page.findById(doc.pageRef)
    .deepPopulate('sprays.comments')
    .exec(function(err,page){
      if(!page){
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!NO PAGE FOUND');
        return false;
      }
      console.log('SOCKET EMIT',arguments);
      socket.to('page/'+page._id).emit('update',page);
    });
}

function onRemove(socket, doc, cb) {
  socket.emit('spray:remove', doc);
}
