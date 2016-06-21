function createServicePack(execlib) {
  'use strict';

  return {
    service: {
      dependencies: ['allex:identityuserexposer']
    },
    sinkmap: {
      dependencies: ['allex:identityuserexposer']
    }
  };
}

module.exports = createServicePack;

