'use strict';

const {exec} = require('child_process');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.handler = this.handler.bind(this);
    
    this.hooks = {
      'before:deploy:deploy': this.configureStage.bind(this),
      'before:remove:remove': this.configureStage.bind(this),
    };
  }

  log(message) {
    this.serverless.cli.log("gitref-stage: " + message);
  }

  handler(err, stdout, stderr) {
    if (err) {
      this.serverless.cli.log(stderr);
    }
  
    let ref = stdout.substring(0, stdout.length - 1);
  
    if (ref !== "HEAD") {
      this.log("Changing stage to: " + ref + " based on current git HEAD");
      this.options.stage = ref;
    }
    else {
      exec("git rev-parse HEAD", this.handler);
    }
  }
  
  configureStage() {
    if(typeof this.options.s !== "undefined") {
      this.log("Stage set by commandline option (-s), skipping...");
    } else {
      exec("git rev-parse --abbrev-ref HEAD", this.handler);  
    }
  }
  
}

module.exports = ServerlessPlugin;
