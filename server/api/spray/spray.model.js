'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate');

var SpraySchema = new Schema({
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
        default: []
    }]
});

SpraySchema.plugin(deepPopulate, {});

module.exports = mongoose.model('Spray', SpraySchema);
