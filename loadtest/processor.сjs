// loadtest/processor.js
function genUser(ctx, events, done) {
    const n = Math.floor(100000 + Math.random() * 900000);
    ctx.vars.email = `user_${n}@test.io`;
    done();
  }
  
  function pickUserId(ctx, events, done) {
    ctx.vars.userId = ctx.vars.userId || ctx.vars.userIdFallback;
    if (!ctx.vars.userId) return done(new Error("No userId in signup response"));
    done();
  }
  
  function pickToken(ctx, events, done) {
    ctx.vars.token = ctx.vars.token || ctx.vars.tokenFallback;
    if (!ctx.vars.token) return done(new Error("No token in login response"));
    done();
  }
  
  module.exports = { genUser, pickUserId, pickToken };
  