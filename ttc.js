/*
Trending Topics Client - command line tool to get trending topics from Twitter

Copyright (c) 2010 Fabricio Campos Zuardi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

//= Globals

//== Libraries
var  sys = require('sys')
    ,http = require('http')
    ,arguments = require('./lib/node-arguments')
    ,conn = require('./lib/node-twitter/connection')
    ,trends = require('./lib/node-twitter/trends')
    ,config = require('./config/setup');

//== Variables
var  client
    ,options = config.options;

//== Twitter OAuth Config (/config/twitter.js)
try{
  var  tw_config = require('./config/twitter').tokens
      ,signer = conn.signer(tw_config.CONSUMER_KEY, tw_config.CONSUMER_SECRET, tw_config.OAUTH_TOKEN, tw_config.OAUTH_TOKEN_SECRET);
  client = conn.authenticatedClient(config.API_PORT_SSL, config.API_URL);
}catch(e){
  client = conn.unauthenticatedClient(config.API_PORT, config.API_URL);
}

//= Command Line Options
arguments.parse([
     {'name': /^(-h|--help)$/, 'expected': null, 'callback': printHelp}
    ,{'name': /^(--version)$/, 'expected': null, 'callback': printVersion}
    ,{'name': /^(-l|--location)$/, 'expected': /^([A-Za-z]{2}|[0-9]+)$/, 'callback': changeLocation}
    ,{'name': /^(-f|--format)$/, 'expected': /^(normal|names|json)$/, 'callback': changeFormat}
  ], main, invalidArgument);

//== printHelp()
function printHelp(){
  printDefaultHeader();
  printAndExit(config.HELP_TEXT, 0);
}

//== printVersion()
function printVersion(){
  printAndExit(config.VERSION+'\n', 0);
}

//== changeLocation()
function changeLocation(end, location){
  var l = location.toLowerCase();
  if ((l.match(/^([A-Za-z]{2})$/)) && (!config.KNOWN_COUNTRY_CODES[l])) { 
    invalidArgument(location, false);
    return false
  };
  options.woeid = (config.KNOWN_COUNTRY_CODES[l])?(config.KNOWN_COUNTRY_CODES[l]):location;
  end();
}

//== changeFormat()
function changeFormat(end, fmt){
  options.output_format = fmt;
  end();
}

//= Main
function main(){
  if (config.options.output_format.match(/^(normal)$/)) { printDefaultHeader();}
  trends.getLocalTrends(options.woeid, 'xml', client, signer, onXMLLoaded, onRequestFail);
  // trends.getLocalTrends(options.woeid, 'json', client, signer, onJSONLoaded, onRequestFail);
};

//= Functions

function onXMLLoaded(){
  var result = trends.parseTrendsXML(this.data);
  result['remaining_calls'] = this.headers["x-ratelimit-remaining"];
  outputResult(result);
}

function onJSONLoaded(){
  var result = JSON.parse(this.data)[0];
  result['remaining_calls'] = this.headers["x-ratelimit-remaining"];
  outputResult(result);
}

function onRequestFail(msg, response){
  console.log('Error: '+msg);
  console.log(response);
}

//== printDefaultHeader()
function printDefaultHeader(){
  console.log(config.SCRIPT_TITLE);
  if (process.argv.length == 2){
    console.log('Check the HELP page: node '+ __filename.substring(__dirname.length+1, __filename.length) +' -h\n');
  }
}

//== outputResult()
function outputResult(content){
  var as_of_date = new Date(content['as_of']);
  var output = '';
  var fmt = config.options.output_format;
  var normal_mode = fmt.match(/^(normal)$/);
  switch (fmt){
    case 'json':
      output = JSON.stringify(content);
      break;
    case 'normal':
    case 'names':
    default:
      // output += normal_mode?('\n'):'';
      for (i=0;i<content['trends'].length;i++){
        output += normal_mode?((i+1) + '. '):'';
        output += entitiesToChar(content['trends'][i]['name']);
        output += normal_mode?(' - ' + content['trends'][i]['url']):'';
        output += '\n';
      }
      if (normal_mode){
        output += '\n';
        output += 'Location: '+ config.KNOWN_WOEIDS[options['woeid']]+'\n'
        output += 'Time: '+as_of_date.toLocaleString() +')\n'
        output += 'API calls remaining: '+content['remaining_calls']+'\n';
      }
  }
  output += '\n';
  printAndExit(output, 0);
  return true;
}

//= Helpers

//== printAndExit()
function printAndExit(msg, exitcode){
  exitcode = (exitcode == undefined) ? 0 : exitcode;
  process.stdout.end(msg);
  process.stdout.addListener('close', function(){
    process.exit(exitcode);
  });
}

//== entitiesToChar()
function entitiesToChar(text){
  // Convert Decimal numeric character references ex: &#195; to Ã
  text = text.replace(/&#([0-9]{1,7});/g, function(match, submatch) { return String.fromCharCode(submatch);} );
  return text;
}

//== invalidArgument()
function invalidArgument(arg, value_missing){
  printAndExit('Error: the argument '+arg+' '+(value_missing?'expects a value':'is not valid.')+'\n', 1);
}