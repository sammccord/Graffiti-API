'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate');
var findOrCreate = require('mongoose-findorcreate')

var SpraySchema = new Schema({
		org_id: String,
    name: String,
    info: String,
    active: Boolean,
    targetText: String,
    targetDiv: String,
    targetImage: String,
    p_index: {type:Number, default:-1},
    spray_color:{type:String, default:'rgb(96, 96, 96)'},
    pageRef: {
      type: Schema.Types.ObjectId,
      ref: 'Page'
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: []}],
    createdAt: {type:Date},
    updatedAt: {type:Date}
});

SpraySchema.pre('save', function(next){
  var now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});

SpraySchema.plugin(deepPopulate, {});
SpraySchema.plugin(findOrCreate);

module.exports = mongoose.model('Spray', SpraySchema);
