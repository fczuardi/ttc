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
    ,oauth = require('./lib/node-oauth/lib/oauth');

//== Constants
var  API_URL = 'api.twitter.com'
    ,API_PORT = 80
    ,API_PORT_SSL = 443
    ,LOCAL_TRENDS_PATH = '/1/trends/'
    ,KNOWN_WOEIDS = {
       '1': 'Worldwide'
      ,'23424768': 'Brazil'
      ,'23424977': 'United States'
      ,'23424975': 'United Kingdom'
      ,'23424900': 'Mexico'
      ,'23424803': 'Ireland'
      ,'23424775': 'Canada'
      ,'2358820': 'Baltimore, United States'
      ,'2367105': 'Boston, United States'
      ,'2514815': 'Washington, United States'
      ,'2459115': 'New York, United States'
      ,'2487796': 'San Antonio, United States'
      ,'2379574': 'Chicago, United States'
      ,'2471217': 'Philadelphia, United States'
      ,'2487956': 'San Francisco, United States'
      ,'2442047': 'Los Angeles, United States'
      ,'2424766': 'Houston, United States'
      ,'2357024': 'Atlanta, United States'
      ,'2406080': 'Fort Worth, United States'
      ,'2388929': 'Dallas, United States'
      ,'2490383': 'Seattle, United States'
      ,'455827': 'São Paulo, Brazil'
      ,'44418': 'London, United Kingdom'
    }
    ,KNOWN_COUNTRY_CODES = {
       'br': '23424768'
      ,'ca': '23424775'
      ,'gb': '23424975'
      ,'ie': '23424803'
      ,'mx': '23424900'
      ,'us': '23424977'
    }
    ,SCRIPT_NAME = 'Trending Topics Client (for Twitter)'
    ,SCRIPT_VERSION = 'v0.1'
    ,SCRIPT_SOURCE_CODE_URL = 'http://github.com/fczuardi/ttc'
    ,SCRIPT_TITLE = '\n'+SCRIPT_NAME+' '+SCRIPT_VERSION+
                    '\n-----------------------------------\n';

//== Header
printDefaultHeader();

//== Twitter OAuth Config (/config/twitter.js)
try{
  var tw_config = require('./config/twitter').tokens;
  var  consumer = oauth.createConsumer(tw_config.CONSUMER_KEY, tw_config.CONSUMER_SECRET)
      ,token = oauth.createToken(tw_config.OAUTH_TOKEN, tw_config.OAUTH_TOKEN_SECRET)
      ,signer = oauth.createHmac(consumer, token)
      ,client = oauth.createClient(API_PORT_SSL, API_URL , true);
}catch(e){
  console.log('TIP: You can raise the API calls limit by setting up your Twitter OAuth tokens. Edit the file /config/twitter-example.js and save it as /config/twitter.js\n')
  client = http.createClient(API_PORT, API_URL , false);
}

//== Variables
var  response_formats = ['json', 'xml'] //json output sometimes stop working, so we check both
    ,trends_request = {'xml':{},'json':{}}
    ,current_trends = {'xml':{},'json':{}}
    ,last_trends = {'as_of': 0, 'trends': [] }
    ,invalid_syntax = false
    ,options_callbacks = [];

//== Default options
var options = { 'woeid' : '1'}

//= Command Line Options
valid_arguments = [
   {'name': /^(-h|--help)$/, 'expected': null, 'callback': printHelp}
  ,{'name': /^(-l|--location)$/, 'expected': /^([A-Za-z]{2}|[0-9]+)$/, 'callback': changeLocation}
];
if (process.argv.length <=2) { main(); }
for(i=2; i < process.argv.length; i++){
  argument = process.argv[i];
  next_argument = process.argv[i+1];
  invalid_syntax = true;
  for (j=0; j<valid_arguments.length; j++){
    if (valid_arguments[j]['name'].test(argument)){
      invalid_syntax = false;
      if (valid_arguments[j]['expected']){
        //option requires a value, check if the provided match the expected syntax
        if (!valid_arguments[j]['expected'].test(next_argument)){ 
          invalidArgument(next_argument ? next_argument : argument, (next_argument==undefined));
          break;
        }
        i++;
      }
      if (valid_arguments[j]['callback']) {
        options_callbacks.push({
          'callback': valid_arguments[j]['callback']
          ,'argument': valid_arguments[j]['expected'] ? next_argument : null
        });
      }
      continue;
    }
  }
  if (invalid_syntax) { invalidArgument(argument); break; }
}
//execute all options callbacks
options_callbacks.forEach(function(item){
  item['callback'](item['argument'])
});

//== Manual
function printHelp(){
  var country_codes = [];
  for(code in KNOWN_COUNTRY_CODES){
    country_codes.push(code +' - '+KNOWN_WOEIDS[KNOWN_COUNTRY_CODES[code]]);
  }
  var woeids = [];
  for(woeid in KNOWN_WOEIDS){
    woeids.push(woeid +' - '+KNOWN_WOEIDS[woeid]);
  }
  var help_text = '\
Usage:\
\n\tnode '+ __filename.substring(__dirname.length+1, __filename.length) +' [option value] [option value]…\
\n\
\nOptions:\
\n\t-l/--location:\
\n\t\tDefault value: '+options['woeid']+'\
\n\t\tTwo letter country code or the woeid code for the location you want.\
\n\
\n\t\tThe currently supported country codes are:\n\t\t\t'+ country_codes.join('\n\t\t\t') +'\
\n\
\n\t\tSome known woeid codes:\n\t\t\t'+ woeids.join('\n\t\t\t') +'\
\n\
\n\t\tFor an up-to-date list of locations provided by Twitter, access:\
\n\t\t\tcurl http://api.twitter.com/1/trends/available.xml\
\n\
\nAuthor:\
\n\tFabricio Campos Zuardi\
\n\tTwitter: @fczuardi\
\n\tWebsite: http://fabricio.org\
\n\
\nContributions:\
\n\t'+SCRIPT_NAME+' is a Free Software released under the MIT License, which\
\n\tmeans that you are welcome to copy, study and modify this software and, why not,\
\n\teven contribute with improvements and bug fixes!\
\n\
\n\tThe code is hosted at '+SCRIPT_SOURCE_CODE_URL+'\
\n\
\nThanks for using it! :)\
\n\n';
   
  printAndExit(help_text, 0);
}

//== Default Header
function printDefaultHeader(){
  console.log(SCRIPT_TITLE);
  if (process.argv.length == 2){
    console.log('Check the HELP page: node '+ __filename.substring(__dirname.length+1, __filename.length) +' -h\n');
  }
}

//= Functions

//== main()
function main(){
  getCurrentTrends('xml');
  // getCurrentTrends('json');
}

//== changeLocation()
function changeLocation(location){
  options.woeid = (KNOWN_COUNTRY_CODES[location])?(KNOWN_COUNTRY_CODES[location]):location;
  main();
}

//== getCurrentTrends()
function getCurrentTrends(fmt){
  current_trends[fmt] = {'as_of': 0, 'body': '', 'remaining_calls': 0, 'trends': []}
  if (tw_config){
    trends_request[fmt] = client.request('GET', LOCAL_TRENDS_PATH + options['woeid'] + '.' + fmt, null, null, signer);
  } else {
    trends_request[fmt] = client.request('GET', LOCAL_TRENDS_PATH + options['woeid'] + '.' + fmt, {'host': API_URL});
  }
  trends_request[fmt].addListener('response', function(response) {
    var response_type = (response.headers['content-type'].indexOf('xml') != -1) ? 'xml' :
                        ((response.headers['content-type'].indexOf('json') != -1) ? 'json' : 'other')
    response.setEncoding('utf8');
    // error handling
    if (response.statusCode != 200) { return responseError(response, 'error', 'Request failed.', '8309740116819739'); }
    if (response.headers["x-ratelimit-remaining"] < 100) { responseError(response, 'warning', 'We are reaching the limit!!', ('7925415213685483')) }
    if (response_type == 'other') { return responseError(response, 'error', 'Wrong MIME Type.', '20324136363342404'); }
    current_trends[fmt]['remaining_calls'] = response.headers["x-ratelimit-remaining"];
    // what to do when data comes in
    if (response_type == 'xml'){
      parseTrendsXML(response);
    }else {
      parseTrendsJSON(response);
    }
  });
  trends_request[fmt].end(); //make the request
}

//== parseTrendsXML()
function parseTrendsXML(response) {
  response.addListener('data', function (chunk) {
    current_trends['xml']['body'] += chunk;
  });
  response.addListener('end', function () {
    var as_of_re = /as_of="([^"]*)"/gim;
    var as_of_matches = as_of_re.exec(current_trends['xml']['body']);
    var as_of = Date.parse(as_of_matches[1]);
    if (as_of <= last_trends['as_of']){ 
      console.log(as_of+' so skip');
      return false
    }
    //<trend query="Ursinhos+Carinhosos" url="http://search.twitter.com/search?q=Ursinhos+Carinhosos">Ursinhos Carinhosos</trend>
    var trend_re = /<trend[^>]*>[^<]*<\/trend>/gim;
    var trend_matches = current_trends['xml']['body'].match(trend_re);
    var trend_data_re = /<trend\s*query="([^"]*)"\surl="([^"]*)"[^>]*>([^<]*)<\/trend>/i;
    if (!trend_matches) { return responseContentError(current_trends['xml']['body'], 'error', 'XML contains no trends.', '5253734595607966');}
    for (i=0;i<trend_matches.length;i++){
      var trend_data_matches = trend_data_re.exec(trend_matches[i]);
      current_trends['xml']['trends'].push({
         'name': trend_data_matches[3]
        ,'query': trend_data_matches[1]
        ,'url': trend_data_matches[2]
        });
    }
    current_trends['xml']['as_of'] = as_of;
    last_trends = current_trends['xml'];
    trendsParsed(current_trends['xml']);
  });
}

//== parseTrendsJSON()
function parseTrendsJSON(response){
  response.addListener('data', function (chunk) {
    current_trends['json']['body'] += chunk;
  });
  response.addListener('end', function () {
    //error handling
    try{
      result = JSON.parse(current_trends['json']['body'])[0];
    }catch(e){
      return responseContentError(result, 'error', 'Could not parse JSON.', '05745784239843488');
    }
    if (!result['as_of']){ return responseContentError(result, 'error', 'Response doesn’t have timestamp.', '9761156134773046'); }
    var as_of = Date.parse(result['as_of'])
    if (as_of <= last_trends['as_of']){ return responseContentError(result, 'info', 'The result we have is newer than this one, skip it.', '3963864736724645'); }
    if (!result['trends']){ return responseContentError(result, 'error', 'Response doesn’t have trends list.', '8779761055484414'); }
    if (result['trends'].length == 0){ return responseContentError(result, 'error', 'Response trends list is empty.', '6612175547052175'); }
    //build ranking
    for (i=0;i<result['trends'].length;i++){
      current_trends['json']['trends'].push(result['trends'][i]);
    }
    current_trends['json']['as_of'] = as_of;
    last_trends = current_trends['json'];
    trendsParsed(current_trends['json']);
  });
}

//== trendsParsed()
function trendsParsed(content){
  var as_of_date = new Date(content['as_of']);
  var output = '';
  output += 'Trending Topics (as of '+ as_of_date.toLocaleString() +')\nLocation: '+ KNOWN_WOEIDS[options['woeid']] +'\n\n'
  for (i=0;i<content['trends'].length;i++){
    output += (i+1) + '. ' + entitiesToChar(content['trends'][i]['name']) + ' - ' + content['trends'][i]['url'] +'\n';
  }
  output += '\n('+ content['remaining_calls'] +' API calls remaining)\n\n';
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
  if (value_missing) {
    printAndExit('Error: the argument '+arg+' requires a value.\n\n');
  }else{
    printAndExit('Error: the argument '+arg+' is not valid.\n\n');
  }
}

//== responseError()
function responseError(response, type, msg, code){
  console.log('== %s: %s (%s) ==', type.toUpperCase(), msg, code);
  console.log(response.statusCode);
  console.log(response.headers);
  return false;
}

//== responseContentError()
function responseContentError(result, type, msg, code){
  console.log('== %s: %s (%s) ==', type.toUpperCase(), msg, code);
  if (type == 'error') {
    console.log(result);
  }
  return false;
}