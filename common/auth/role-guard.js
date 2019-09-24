function FunctionGuard(fn, quietTime, context /*,fixed args*/) {
    this.fn = fn;
    this.quietTime = quietTime || 500;
    this.context = context || null;
    this.fixedArgs = (arguments.length > 3) ? Array.prototype.slice.call(arguments, 3) : [];
}
 
FunctionGuard.prototype.run = function(/*dynamic args*/) {
    this.cancel(); //clear timer
    var fn = this.fn, context = this.context, args = this.mergeArgs(arguments);
    var invoke = function() {
        fn.apply(context,args);
    }
    this.timer = setTimeout(invoke,this.quietTime); //reset timer
}
 
FunctionGuard.prototype.mergeArgs = function(dynamicArgs) {
    return this.fixedArgs.concat(Array.prototype.slice.call(dynamicArgs,0)); 
}
 
FunctionGuard.prototype.cancel = function(){
    this.timer && clearTimeout(this.timer);
}