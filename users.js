/**
 * Model and controller for users
 */

/**
 * @constructor
 */
User = function User(doc) { _.extend(this, doc); };

User.collection = new Mongo.Collection("users");
User.collection.attachSchema(new SimpleSchema({
  _id: {
    label: "SCIPER",
    type: String,
    regEx: /G?[1-9][0-9]{3,6}/  // SCIPER for guests and employees
  },
  password: {
    type: String
  }
}));

User.Search = new Search("userSearch");

// TODO: This is just a placeholder for now.
User.bySciper = function(sciper) { return new User() };
_.extend(User.prototype, {
  canEdit: function(whom) { return true; }
});

/* User search.
 *
 * TODO: LDAP searches should be on-demand only; the default intent when typing
 * in the user search box is to see only users already known in the database.
 */
if (Meteor.isServer) {
  var ldapContext = Meteor.npmRequire('epfl-ldap')();
  var getSyncUserByName = Meteor.wrapAsync(ldapContext.users.searchUserByName);

  User.Search.publish(function (query) {
    var self = this;

    if (query.length < 3) {
      self.stop();
      return;
    }

    if (! Devsupport.isOnline()) {
      return Devsupport.fakeData.searchUsers(query, self);
    }
    getSyncUserByName(query).forEach(function (result) {
      self.added(result.sciper, {fullName: result.displayName});
    });
  });
}

if (Meteor.isClient) {
  Template.userSearchResult.helpers({
    getUsers: _.bind(User.Search.results.find, User.Search.results, {}),
    isLoading: _.bind(User.Search.isLoading, User.Search)
  });

  Template.userSearchBox.events({
    "keyup #search-box": function(e) {
      User.Search.search($(e.target).val().trim());
    }
  });

  Template.userEdit.events({
    "submit form": function(e) {
      console.log(this);
      return false;
    }
  });
}
