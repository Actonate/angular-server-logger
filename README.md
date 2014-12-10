angular-server-logger
=====================

Logging Exceptions (with Stack Trace) and Messages to remote server

Install stacktrace.js as a dependency and add it to your angular project by following instructions from: https://github.com/stacktracejs/stacktrace.js/

Declare act.Logging as a dependency to your angular application.

The urls to each action of logging can be configured using the 'actLoggingConfigure' provider by passing the params in an object.

Example:

```
angular.module('sampleApp', ['act.Logging']).config(['actLoggingConfigureProvider', function(actLoggingConfigureProvider) {
  actLoggingConfigureProvider.configure({
    application_debug_url:"http://127.0.0.1:4321/debugLogger",
    application_log_url:"http://127.0.0.1:4321/logger",
    application_error_url:"http://127.0.0.1:4321/errorLogger",
    application_info_url:"http://127.0.0.1:4321/infoLogger",
    application_warn_url:"http://127.0.0.1:4321/warnLogger",
    exception_url:"http://127.0.0.1:4321/exceptionLogger",
    server_logging:true,
    client_logging:true
    });
}]);
```
Now automatically all the exceptions would be picked up by the module's 'exceptionLogging' service.

Also for logging within the application for server calls and business logic 'appLogging' service can be made use.

appLogging has the following function:
error, debug, log, info, warn.

Based on: http://engineering.talis.com/articles/client-side-error-logging/
