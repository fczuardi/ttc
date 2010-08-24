var  http = require('http')
    ,oauth = require('../node-oauth/lib/oauth')

var defaults = {};
defaults.API_URL = 'api.twitter.com'
defaults.API_PORT = 80
defaults.API_PORT_SSL = 443

this.signer = function(consumer_key, consumer_secret, oauth_token, oauth_token_secret){
  var  consumer = oauth.createConsumer(consumer_key, consumer_secret)
      ,token = oauth.createToken(oauth_token, oauth_token_secret);
  return oauth.createHmac(consumer, token);
}

this.authenticatedClient = function(port, url){
  var  url = url?url:defaults.API_URL
      ,port = port?port:defaults.API_PORT_SSL;
  return oauth.createClient(port, port , true);;
}

this.unauthenticatedClient = function(port, url){
  var  url = url?url:defaults.API_URL
      ,port = port?port:defaults.API_PORT_SSL;
  return http.createClient(port, url , false);
}