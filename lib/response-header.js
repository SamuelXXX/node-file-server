'use strict'
var responseHeader=function()
{
    this.header={};
    this.pushHeader=function(name,content){
        this.header[name]=content;
    };
}

module.exports=responseHeader;