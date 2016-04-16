function createClientSide(execlib) {
  'use strict';
  var execSuite = execlib.execSuite,
  identityuserexposerServicePack = execSuite.registry.get('allex_identityuserexposerservice'),
  ParentServicePack = identityuserexposerServicePack;

  return {
    SinkMap: require('./sinkmapcreator')(execlib, ParentServicePack)
  };
}

module.exports = createClientSide;
