/**
 * Access control mechanisms
 *
 * This file is for mechanism only – See policy.js  ifor the policy
 */

var debug = Debug("access-control.js");

/******** Tequila *********/

Meteor.startup(function() {
  Tequila.options.bypass.push("/images/");
});

// SCIPER is the _id of documents in Meteor.users:
Tequila.options.getUserId = function getUserId(tequilaResponse) {
  return Meteor.users.findOne({_id: tequilaResponse.uniqueid});
};

function signalServerError(module) {
  var i18nClass = module + "Error";  // i.e. TequilaError, BecomeError
  return function(error) {
    if (! error) return;
    var i18nKey = (error instanceof Meteor.Error) ? error.error : String(error);
    alert(TAPi18n.__("AccessControl." + i18nClass + "." + i18nKey));
  };
}

Tequila.options.onServerError = signalServerError("Tequila");

/**** Becoming another user *********/

Become.policy(function(uid_from, uid_to) {
  Policy.canBecomeAnotherUser.check(uid_from);
  return true;
});


/**** Other mechanisms for applying the policy *****/

Meteor.startup(function () {
  /**
   * Return the currently logged-in user.
   *
   * When Become is in play, this is the user that the client switched *to*
   * ("effective user" in UNIX parlance).
   */
  User.current = function() {
    return Meteor.user();
  }
});

Policy.prototype.publish = function(resultsFunc) {
  if (! Meteor.isServer) return;

  var policy = this;

  Meteor.publish(null, function() {
    if (! this.userId) return;  // No policy yet that allows non-logged-in users
    var user = Meteor.users.findOne({_id: this.userId});
    if (! policy.isAllowed(user)) {
      debug("Policy " + policy.name + " denies publish to " + this.userId);
      return;
    }
    return resultsFunc(user);
  });
};

/********** Access control UI ****************/
if (! Meteor.isClient) return;

Template.AccessControl$WhoAmI.helpers({
  user: function() { return Meteor.user() },
  canBecome: function() {
    try {
      Policy.canBecomeAnotherUser.check(Meteor.user());
      return true;
    } catch (e) {
      return false;
    }
  },
  hasBecome: function() { return false }
});

Template.User$Pick.events({
  'user:selected #AccessControlBecomeThisUser': function(event, that, id) {
    Become.become(id, signalServerError("Become"));
    event.preventDefault();
  }
});

Template.AccessControl$WhoAmI.events({
  'click #unbecome': Become.restore
});

Template.AccessControl$WhoAmI.helpers({
  hasBecome: function() {
    return !! Become.realUser();
  },
  realUser: function() { return Become.realUser(); }
});