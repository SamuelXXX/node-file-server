'use strict';
var http=require("http");
var fs=require("fs");
var url=require("url");
var queryString=require("querystring");

var servUtil=require("./server-utility");
var serverConfig=require("./server-config");
var reqType=require("./request-type");
var mime=require("./mime");

var server=http.createServer(function(req,res){
    var pathName=url.parse(req.url).pathname;
    var query=url.parse(req.url).query;
    var queryObject=queryString.parse(query);
    if(query!="")
    {
        var src=queryObject.src;
        var cmd=queryObject.cmd;
        if(typeof src =="string")
        {
            src="./resources/"+src;
            servUtil.responseFullContent(res,src);
            return;
        }

        if(typeof cmd =="string")
        {
            //Wait to implement some command code
            return;
        }
    }
    try{
        pathName=decodeURI(pathName);
    }
    catch(e)
    {
        console.error(e.toString());
        res.writeHead(500);
        res.end();
        return;
    }
    
    pathName=serverConfig.root+pathName;

    switch(reqType.checkRequestType(pathName))
    {
        case reqType.invalid:
        res.writeHead(404);
        res.end();
        return;
        case reqType.main:
        case reqType.folder:
        if(!fs.existsSync(pathName))
        {
            res.writeHead(404);
            res.end();
            return;
        }

        fs.readdir(pathName,function(err,dirList){
            if(err)
            {
                console.error(err);
                res.writeHead(500);
                res.end();
                return;
            }

            var folders=[];
            var files=[];
    
            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
            for(var i=0;i<dirList.length;i++)
            {
                var path=pathName+dirList[i];
                var stat=fs.statSync(path);
                if(stat.isDirectory())
                {
                    folders.push(dirList[i]);
                }
                else{
                    files.push(dirList[i]);
                }
            }
            res.write(servUtil.generateFolderDisplayPage(pathName,folders,files)); 
            res.end();
        });
        break;
        case reqType.file:
        
        if(fs.existsSync(pathName))
        {	
            var fileStat=fs.statSync(pathName);

            if(req.headers["range"]!=null||fileStat.size>20000000)
            {
                servUtil.responsePartialContent(res,pathName,req.headers["range"]);
            }
            else{
                servUtil.responseFullContent(res,pathName);								
            }
        }
        else{
            res.writeHead(404);
            res.end();
        }
        break;
        default:
        break;
    }
});

function start()
{
    server.listen(parseInt(serverConfig.port));
}

exports.start=start;
