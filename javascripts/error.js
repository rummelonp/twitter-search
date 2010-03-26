var onSilverlightError = function(sender, args) {
    var appSource = "";
    if (sender != null && sender != 0) {
        appSource = sender.getHost().Source;
    } 
    var errorType = args.ErrorType;
    var iErrorCode = args.ErrorCode;
    
    var errMsg = "Unhandled Error in Silverlight 2 Application " +  appSource + "ﾂ･n" ;

    errMsg += "Code: "+ iErrorCode + "    ﾂ･n";
    errMsg += "Category: " + errorType + "       ﾂ･n";
    errMsg += "Message: " + args.ErrorMessage + "     ﾂ･n";

    if (errorType == "ParserError")
    {
        errMsg += "File: " + args.xamlFile + "     ﾂ･n";
        errMsg += "Line: " + args.lineNumber + "     ﾂ･n";
        errMsg += "Position: " + args.charPosition + "     ﾂ･n";
    }
    else if (errorType == "RuntimeError")
    {           
        if (args.lineNumber != 0)
        {
            errMsg += "Line: " + args.lineNumber + "     ﾂ･n";
            errMsg += "Position: " +  args.charPosition + "     ﾂ･n";
        }
        errMsg += "MethodName: " + args.methodName + "     ﾂ･n";
    }

    throw new Error(errMsg);
}
