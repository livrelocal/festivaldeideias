App.Ideas.Cocreate = App.BaseView.extend({
  initialize: function(){
    _.bindAll(this);

    // General Settings
    this.chat             = this.$('#chat');
    this.video            = this.$('#cocreation');
    this.channel          = this.chat.data('channel');

    // Pusher
    this.pusherKey        = this.chat.data('pusher-key');
    this.chatMsgList      = this.$('ul.msglist');
    this.chatInputField   = this.$('#input_new_message');
    this.chatForm         = this.$('#new_message');

    // Tokbox
    this.tokboxKey        = this.chat.data('tokbox-key');
    this.tokboxSession    = this.chat.data('tokbox-session');
    this.tokboxToken      = this.chat.data('tokbox-token');

    $("#new_message .loading").hide();

    if (this.tokboxSession != undefined)
      this.initializeTokBox();

    this.chatInputField.keydown(function(e){ 
      if(e.keyCode == 13 && e.shiftKey != 1) { 
        if($("#input_new_message").val().trim() != ""){
          $("#new_message").submit();
          $("#new_message .loading").slideDown(100);
          $("#input_new_message").val("");
          $("#input_new_message").attr("disabled", "disabled");
        }
        return false;
      } 
    });

    this.chatForm.submit(function(){ 
      if($("#input_new_message").val() == "") {return false} 
    });

    this.initializePusher();
  },

  initializePusher: function(){
    var pusher    = new Pusher(this.pusherKey);
    var channel   = pusher.subscribe(this.channel);
    var self      = this;  
    self.chatMsgList.scrollTop(self.chatMsgList.prop("scrollHeight"));


    channel.bind('new-message', function(data){
      $("#new_message .loading").slideUp(100);
      $("#input_new_message").removeAttr("disabled");

      if (self.chatMsgList.length == 0) {
        var list = $("<ul/>").attr('class', 'msglist');
        $('.nomsg').remove();
        $('.chatmsgs').prepend(list);
        list.append(data.message); 
        self.chatMsgList = list;
      } else {
        self.chatMsgList.append(data.message);
        self.chatMsgList.scrollTop(self.chatMsgList.prop("scrollHeight"));
      }
    });

  },

  initializeTokBox: function(){
    // Uncomment/Comment the line below to activate debug for TokBokx
    TB.setLogLevel(TB.DEBUG); 

    var session = TB.initSession(this.tokboxSession);      
    session.addEventListener('sessionConnected', sessionConnectedHandler);      
    session.addEventListener('connectionCreated', connectionCreated);      
    session.addEventListener('streamCreated', streamCreatedHandler);
    session.connect(this.tokboxKey, this.tokboxToken);

    function connectionCreated(connections){
      console.log(connections);
    }

    function sessionConnectedHandler(event) {
      console.log(event.streams)
      publisher = session.publish('cocreation');
      subscribeToStreams(event.streams);
    }

    function streamCreatedHandler(event) {
      subscribeToStreams(event.streams);
    }

    function subscribeToStreams(streams) {
      for (var i = 0; i < streams.length; i++) {

        if (streams[i].connection.connectionId != session.connection.connectionId) {

          var div = document.createElement('div');
          div.setAttribute('id', 'stream' + streams[i].streamId);
          $('#video .videos').append(div);
          session.subscribe(streams[i], div.id);

        }
      } 
    }
  }
});
