function createIdentityClusterExposerService(execlib, ParentServicePack) {
  'use strict';
  var lib = execlib.lib,
    qlib = lib.qlib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry,
    ParentService = ParentServicePack.Service,
    RemoteServiceListenerServiceMixin = execSuite.RemoteServiceListenerServiceMixin;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) 
    };
  }

  function IdentityClusterExposerService(prophash) {
    ParentService.call(this, prophash);
    RemoteServiceListenerServiceMixin.call(this);
    prophash.inusers.forEach(this.huntInUser.bind(this));
  }
  
  ParentService.inherit(IdentityClusterExposerService, factoryCreator);
  RemoteServiceListenerServiceMixin.addMethods(IdentityClusterExposerService);
  
  IdentityClusterExposerService.prototype.__cleanUp = function() {
    RemoteServiceListenerServiceMixin.prototype.destroy.call(this);
    ParentService.prototype.__cleanUp.call(this);
  };

  IdentityClusterExposerService.prototype.huntInUser = function (inusername) {
    this.huntRemote('findAndRun', inusername, {program:{
      sinkname: inusername,
      identity:  {
        name:'asker',
        role: 'service'
      },
      task: {
        name: this.onInUser.bind(this, inusername),
        propertyhash: {
          ipaddress: 'fill yourself',
          wsport: 'fill yourself'
        }
      }
    }});
    //this.state.data.listenFor(inusername, this.onInUser.bind(this, inusername));
  };

  IdentityClusterExposerService.prototype.onInUser = function (inusername, inusersinkinfo) {
    if (!inusersinkinfo) {
      return;
    }
    if (!inusersinkinfo.sink) {
      this.reportAccessInfo(inusername, {}, null, null);
      return;
    }
    inusersinkinfo.sink.call('getTokens').then(
      this.onInUserTokens.bind(this, inusername, inusersinkinfo.ipaddress, inusersinkinfo.wsport)
    );
  };

  IdentityClusterExposerService.prototype.onInUserTokens = function (inusername, ipaddress, port, tokens) {
    try {
    taskRegistry.run('natThis', {
      iaddress: ipaddress,
      iport: port,
      cb: this.reportAccessInfo.bind(this, inusername, tokens),
      singleshot: true
    });
    } catch(e) {
      console.error(e.stack);
      console.error(e);
    }
  };

  IdentityClusterExposerService.prototype.reportAccessInfo = execSuite.dependentServiceMethod([], ['outerSink'], function (outerSink, inusername, tokens, ipaddress, port, defer) {
    //report tokens
    qlib.promise2defer(outerSink.call('reportAccessInfo', {ipaddress: ipaddress, port: port, tokens: tokens}), defer);
  });


  IdentityClusterExposerService.prototype.propertyHashDescriptor = lib.extend(ParentService.prototype.propertyHashDescriptor, {
    inusers: {
      type: 'array'
    }
  });
  
  return IdentityClusterExposerService;
}

module.exports = createIdentityClusterExposerService;
