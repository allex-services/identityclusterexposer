function createServicePack(execlib) {
  'use strict';

  return {
    service: {
      dependencies: ['allex_identityuserexposerservice']
    },
    sinkmap: {
      dependencies: ['allex_identityuserexposerservice']
    }
  };
}

module.exports = createServicePack;

