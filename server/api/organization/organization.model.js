'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate');

var OrganizationSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,
  pages: [{
    type: Schema.Types.ObjectId,
    ref: 'Page',
    default: []
  }]
});

OrganizationSchema.plugin(deepPopulate, {});

module.exports = mongoose.model('Organization', OrganizationSchema);
