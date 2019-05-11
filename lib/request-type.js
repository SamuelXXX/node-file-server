/**
 * Enum used to identify request url type
 */
const requestType={
    invalid:-1,
    /**
     * Main page request with nothing but a '/' in url
     */
    main:0,
    /**
     * Site with slash symbol at the end
     */
    folder:1,
    /**
     * Request for resource file
     */
    file:2,


    /**
     * Check request type,request for a site or a certain file
     * @param {string} pathName Target url path to check request type
     */
    checkRequestType:function(pathName){
        var certainFilePatt=/(\/.+)+\.\w{1,8}$/i;
        var sitePatt=/(\/.+)*\/$/i;

        if(certainFilePatt.test(pathName))
        {
            return requestType.file;        
        }

        if(sitePatt.test(pathName))
        {
            if(pathName=="/")
            {
                return requestType.main;
            }
            else
                return requestType.folder;
        }

        return requestType.invalid;
    }

};

module.exports=requestType;