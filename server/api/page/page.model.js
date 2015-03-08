'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate');

var PageSchema = new Schema({
		url:{
      type: String,
      required: true
    },
    title:{
      type: String,
      required: true
    },
    name:{
      type: String,
      unique: true
    },
    ref: String,
    info: String,
    active: Boolean,
    sprays: [{
        type: Schema.Types.ObjectId,
        ref: 'Spray',
        default: []
    }],
    createdAt: {type:Date},
    updatedAt: {type:Date}
});

PageSchema.pre('save', function(next){
  var now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});

PageSchema.plugin(deepPopulate, {});

module.exports = mongoose.model('Page', PageSchema);
