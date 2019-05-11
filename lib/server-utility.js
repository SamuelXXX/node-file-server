'use strict';

var mime=require("./mime");
var fs=require("fs");
var classRespHeader=require("./response-header");
var serverConfig=require("./server-config");
var logoTable=require("./logo-table");

var folderDisplayPage="#display#";
var itemLine="";

const serverUtility={
    /**
     * Generate folder content display page html string
     * @param {string} title 
     * @param {string[]} folders 
     * @param {string[]} files 
     */
    generateFolderDisplayPage:function(title,folders,files)
    {
        var pageTemp=folderDisplayPage;
        pageTemp=this.replaceTag(pageTemp,"title",title);

        var display="";
        for(var i=0;i<folders.length;i++)
        {
            display+=this.createLinkLine(folders[i],logoTable.dir,true);
        }

        for(var i=0;i<files.length;i++)
        {
            var extPt=/(?<=\.)[a-z0-9]{1,8}$/i;
            var ext=files[i].match(extPt)[0];
            ext=ext.toLowerCase();
            var logoPath=logoTable[ext];
            if(typeof logoPath=="undefined")
            {
                display+=this.createLinkLine(files[i],"fileicons/"+ext+".ico",false);
            }
            else{
                display+=this.createLinkLine(files[i],logoPath,false);
            }
            
        }

        pageTemp=this.replaceTag(pageTemp,"display",display);
        return pageTemp;  
    },

    /**
     * Replace tag like "#XXX#" in source string
     * @param {string} src 
     * @param {string} tagName 
     * @param {string} replaceContent 
     */
    replaceTag:function(src,tagName,replaceContent)
    {
        var tagPattern=new RegExp("#"+tagName+"#");
        if(!tagPattern.test(src))
        {
            return src;
        }

        return src.replace(tagPattern,replaceContent);
    },

    /**
     * 
     * @param {*} name 
     * @param {*} logo 
     * @param {*} isFolder 
     */
    createLinkLine:function(name,logo,isFolder)
    {
        var itemTemplate=itemLine;
        itemTemplate=this.replaceTag(itemTemplate,"logo",logo);
        itemTemplate=this.replaceTag(itemTemplate,"link",name+(isFolder?"/":""));
        itemTemplate=this.replaceTag(itemTemplate,"name",name);
        return itemTemplate;
    },

    /**
     * Response full non-html content from appointed path
     * @param {*} res 
     * @param {string} pathName 
     */
    responseFullContent:function(res,pathName){
        res.writeHead(200, mime.generateContentHeader(pathName));
		fs.readFile(pathName,function(err,data){
						if(err)
						{
							res.writeHead(500);
							res.end();
							return console.error(err);
						}
						res.write(data);
						res.end();
					}); 
    },

    /**
     * Response partial-content from appointed path
     * @param {*} res 
     * @param {string} pathName 
     * @param {*} respHeader
     * @param {string} rangeHeader 
     */
    responsePartialContent:function(res,pathName,rangeHeader="bytes=0-"){		
        fs.open(pathName,"r",function(err,fd){
            if(err)
            {          
                res.writeHead(500);
                res.end();
                console.error(err);
                return;
            }

            var fileStat=fs.statSync(pathName);
            var range=serverUtility.parseHeaderRange(rangeHeader,fileStat.size);
            range=range[0];//Only take the first range parameter cause it is mostly used

            if(range.end-range.start>Number(serverConfig.maxPartialResponse))
            {
                range.end=range.start+Number(serverConfig.maxPartialResponse);
            }

            var resHeader=new classRespHeader();
            resHeader.pushHeader('Content-Type',mime.generateContentHeader(pathName)['Content-Type']);
            resHeader.pushHeader('Content-Range',"bytes " + range.start + "-" + range.end + "/" + fileStat.size);

            res.writeHead(206, resHeader.header);
            
            fs.read(fd,Buffer.alloc(range.end-range.start+1),0,range.end-range.start+1,range.start,function(err,byteRead,buffer){
                if(err)
                {           
                    res.writeHead(500);
                    res.end();
                    console.error(err);
                    return;
                }

                res.write(buffer);	
                res.end();							
            });
        });
    },

        /**
     * Parse request header range 
     * @param {string} rangeHeader range header read from request header
     * @param {number} fileSize target file size
     */
	parseHeaderRange:function(rangeHeader,fileSize){
        rangeHeader=rangeHeader.replace(" ","");
        var rangeHeaderPatt=/^bytes=(\d*-\d*)(,\d*-\d*)*$/i;
        if(!rangeHeaderPatt.test(rangeHeader))
        {
            console.error("Not a legal range header");
            return [];
        }
		var c=rangeHeader.split("=")[1];
		var rangeArray=c.split(",");
		var retArray=[];
		for(var i=0;i<rangeArray.length;i++)
		{
			var o={};
			var s=rangeArray[i].split("-")[0];
			var e=rangeArray[i].split("-")[1];

			o.start=s==""?fileSize-Number(e):Number(s);
			o.end=e==""?fileSize-1:Number(e);
			retArray.push(o);
		}
		return retArray;
    },
};

if(fs.existsSync("./resources/FolderDisplayPage.html"))
{
    folderDisplayPage=fs.readFileSync("./resources/FolderDisplayPage.html").toString();
}
else{
    console.error("Folder display page template not found!");
}

if(fs.existsSync("./resources/LineItem.html"))
{
    itemLine=fs.readFileSync("./resources/LineItem.html").toString();
}
else{
    console.error("Line item template not found!");
}

module.exports=serverUtility;