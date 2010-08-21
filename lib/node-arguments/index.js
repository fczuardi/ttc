/*
Node Arguments - Node.js command line arguments made simple.

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

this.parse = function(valid_arguments, afterParseCallback, invalidArgumentCallback){
  var error, argument, valid_argument
      ,invalid_syntax = true
      ,options_callbacks = []
      ,callbacks_finished_count = 0
      ,args = process.argv.slice(2);

  invalidArgumentCallback = invalidArgumentCallback ? 
                            invalidArgumentCallback : defaultInvalidArgumentCallback;
  afterParseCallback =  afterParseCallback ? 
                        afterParseCallback : defaultAfterParseCallback;
  if (args.length == 0) { afterParseCallback(); return true; }
  for (i=0; i<args.length; i++){
    invalid_syntax = true;
    argument = args[i];
    next_argument = args[i+1];
    for (j=0;j<valid_arguments.length;j++){
      valid_argument = valid_arguments[j];
      if (valid_argument['name'].test(argument)){
        invalid_syntax = false;
        if (valid_argument['expected']){
          i++;
          if ((!next_argument)||(!valid_argument['expected'].test(next_argument))){ 
            invalidArgumentCallback(next_argument ? next_argument : argument, (next_argument==undefined));
            break;
          }
        }
        if (valid_argument['callback']) {
          options_callbacks.push({
            'callback': valid_argument['callback']
            ,'argument': valid_argument['expected'] ? next_argument : null
          });
        }
        continue;
      }
    }
    if (invalid_syntax) { invalidArgumentCallback(argument); break; }
  }
  callbacks_finished_count = options_callbacks.length
  options_callbacks.forEach(function(item){
    item['callback'](function(){
      callbacks_finished_count --;
      if (callbacks_finished_count == 0){
        afterParseCallback();
      }
    }, item['argument']);
  });
}

var defaultAfterParseCallback = function(){
  // console.log('[node-arguments] : All callbacks related with command line arguments finished executing.');
}
var defaultInvalidArgumentCallback = function(arg, value_missing){
  console.log('[node-arguments] : the argument %s %s', arg, (value_missing?'expects a value':'is not valid.'))
}