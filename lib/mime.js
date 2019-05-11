const mime =
{
    /**
     * Generate content-type header
     * @param {string} filePath Target file path
     */
    generateContentHeader:function(filePath){
        filePath = filePath.trim();
        var filePathPatt=/\.\w+$/i;
        if(!filePathPatt.test(filePath))
        {
            return { 'Content-Type': 'text/plain;charset=utf-8' };
        }

        var matchArray=filePath.match(filePathPatt);

        var fileExts = matchArray[0];
        fileExts=fileExts.replace(".","").toLowerCase();
        if (typeof (this[fileExts]) == "undefined") {
            return { 'Content-Type': 'text/plain;charset=utf-8' };
        }
        else {
            return { 'Content-Type': this[fileExts]};
        }
    },


    //Text files
    txt: "text/plain; charset=utf-8",
    rtf: "application/rtf",
    css: "text/css",

    //Image files
    bmp: "application/x-MS-bmp",
    jpg: "image/jpeg",
    jpeg:"image/jpeg",
    png: "image/png",
    gif: "image/gif",
    ico: "application/x-ico",

    //Audio files
    mp3: "audio/mp3",
    au:  "audio/basic",
    mid: "audio/midi",
    ra:  "audio/x-pn-realaudio",
    ram: "audio/x-pn-realaudio",

    //Video files 
    "3gp": "video/3gpp",
	avi: "video/mpeg",
    mp4: "video/mp4",
    mpg: "video/mpeg",
    mpeg:"video/mpeg",
    mkv: "video/mpeg",

    //Zip files
    gz:  "application/x-gzip",
    tar: "application/x-tar",
    rar: "application/x-rar-compressed",
};

module.exports = mime;