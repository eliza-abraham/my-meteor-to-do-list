Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
  Meteor.subscribe('tasks');

  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      if (Session.get('hideCompleted')) {
        return Tasks.find({ checked: { $ne: true }}, { sort: { createdAt: -1 } });
      } else {
        return Tasks.find({}, { sort: { createdAt: -1 } });
      };

    },

    hideCompleted: function () {
      return Session.get('hideCompleted');
    },

    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  Template.body.events({
    'submit .new-task' : function(event) {
      var text = event.target.text.value;
      Meteor.call('addTask', text);
      event.target.text.value = '';
      return false;
    },

    'click .toggle-checked' : function() {
      Meteor.call('setCheckedUnchecked', this);
      return false;
    },

    'click .delete' : function() {
      Meteor.call('deleteTask', this);
      return false;
    },

    'click .hide-completed input' : function(event) {
      console.log('clicked hide completed');
      Session.set('hideCompleted', event.target.checked);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
};

Meteor.methods({
  addTask: function(text) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },

  setCheckedUnchecked: function(task) {
    Tasks.update(task._id, { $set: { checked : !task.checked} });
  },

  deleteTask: function(task) {
    Tasks.remove(task._id);
  }

});


if (Meteor.isServer) {
  Meteor.startup(function () {

  });

  Meteor.publish('tasks', function () {
    return Tasks.find();
  });
}

