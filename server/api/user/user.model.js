'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];
var natural = require('natural');

var UserSchema = new Schema({
  name: String,
  email: { type: String, lowercase: true },
  role: {
    type: String,
    default: 'user'
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {},
  skills: [
            {
              skill_tag: {type: mongoose.Schema.ObjectId, ref: 'Tag'},
              skill_level: {type:Number, required:true}
            }
          ],
  search_terms: [
                {
                  term: String,
                  count: Number
                }
              ]
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },


  populateSkills: function(cb) {
    // create simple array of skill ids
    var skill_arr = this.skills;
    var skill_tags = skill_arr.map(function(item){
      return item.skill_tag;
    });
    var self = this;
    mongoose.model('Tag').find({_id:{$in:skill_tags}}).exec()
      .then(function(tagArr){
        var new_skills_arr = tagArr.map(function(item){
          var i=0;
          while(i<self.skills.length){
            if(String(self.skills[i].skill_tag)==String(item._id)){
              var new_item = {'skill_tag': item, 'skill_level': self.skills[i].skill_level};
              return new_item;
            }
            i++;
          }
        });
        var pop_user = self.toObject();
        pop_user.skills=new_skills_arr;
        cb(null, pop_user);
      });
  },

  addSearchTerms: function(terms){
    var i=terms.length;
    while(i--){
      var stem_term = natural.PorterStemmer.stem(terms[i]);
      var j=this.search_terms.length;
      if(!j) {
        this.search_terms.push( {term:terms[i], count:1} );
      } else {
        while(j--){
          if(natural.PorterStemmer.stem(this.search_terms[j].term)===stem_term) {
            this.search_terms[j].count++;
            break;
          }
          else if(!j){
            this.search_terms.push( {term:terms[i], count:1} );
          }
        }
      }
    }

    // Sort search terms in order of decreasing count
    i = this.search_terms.length-1;
    var ordered=false;

    while(i-- && !ordered){
      // ordered = true;
      for(j=0;j<i;j++){
        if(this.search_terms[j].count<this.search_terms[j+1].count){
          var temp = this.search_terms[j];
          this.search_terms[j]= this.search_terms[j+1];
          this.search_terms[j+1]= temp;
          // ordered=false;
        }
      }
    }

    this.save();
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
