(function(){
  var app = angular.module('act.Logging', []);
  //App level services goes here

  // Application level configuration
  var SERVER_LOGGING = {
    application_debug_url:"http://127.0.0.1:4321/debugLogger",
    application_log_url:"http://127.0.0.1:4321/logger",
    application_error_url:"http://127.0.0.1:4321/errorLogger",
    application_info_url:"http://127.0.0.1:4321/infoLogger",
    application_warn_url:"http://127.0.0.1:4321/warnLogger",
    exception_url:"http://127.0.0.1:4321/exceptionLogger",
    server_logging:true,
    client_logging:true
  };

  app.provider('actLoggingConfigure', function() { //Add any providers as config time dependency in the function parameters
    return {
      configure: function(options){
        SERVER_LOGGING.application_debug_url=options.application_debug_url;
        SERVER_LOGGING.application_log_url=options.application_log_url;
        SERVER_LOGGING.application_error_url=options.application_error_url;
        SERVER_LOGGING.application_info_url=options.application_info_url;
        SERVER_LOGGING.application_warn_url=options.application_warn_url;
        SERVER_LOGGING.exception_url=options.exception_url;
        SERVER_LOGGING.server_logging=options.server_logging;
        SERVER_LOGGING.client_logging=options.client_logging;
      },
      $get: function() {//Add any services as runtime time dependency in the function parameters
        return {};
      }
    };
  });

  /**
  * Service that gives us a nice Angular-esque wrapper around the
  * stackTrace.js pintStackTrace() method.
  */
  app.factory("traceService",function(){
      return({
        print: printStackTrace
      });
    }
  );

  app.provider("$exceptionHandler",{
    $get: function(exceptionLogging){
        return(exceptionLogging);
      }
    }
  );

  /**
  * Exception Logging Service, currently only used by the $exceptionHandler
  * it preserves the default behaviour ( logging to the console) but
  * also posts the error server side after generating a stacktrace.
  */
  app.factory("exceptionLogging",function($log, $window, traceService){
      function error(exception, cause){
        // preserve the default behaviour which will log the error
        // to the console, and allow the application to continue running.
        if(SERVER_LOGGING.client_logging){
          $log.error.apply($log, arguments);
        }
        // now try to log the error to the server side.
        if(SERVER_LOGGING.server_logging){
          try{
            var errorMessage = exception.toString();

            // use our traceService to generate a stack trace
            var stackTrace = traceService.print({e: exception});

            // use AJAX (in this example jQuery) and NOT
            // an angular service such as $http
            $.ajax({
              type: "POST",
              url: SERVER_LOGGING.exception_url,
              contentType: "application/json",
              data: angular.toJson({
                url: $window.location.href,
                message: errorMessage,
                type: "exception",
                stackTrace: stackTrace,
                cause: ( cause || "")
              })
            });
          }
          catch (loggingError){
            $log.warn("Error server-side logging failed");
            $log.log(loggingError);
          }
        }
      }
      return(error);
    }
  );

  /**
  * Application Logging Service to give us a way of logging
  * error / debug statements from the client to the server.
  */
  app.factory("appLogging",function($log, $window){
      return({
        error: function(message){
          // preserve default behaviour
          if(SERVER_LOGGING.client_logging){
            $log.error.apply($log, arguments);
          }
          // send server side
          if(SERVER_LOGGING.server_logging){
            $.ajax({
              type: "POST",
              url: SERVER_LOGGING.application_error_url,
              contentType: "application/json",
              data: angular.toJson({
                url: $window.location.href,
                message: message,
                type: "error"
              })
            });
          }
        },
        debug: function(message){
          // preserve default behaviour
          if(SERVER_LOGGING.client_logging){
            $log.log.apply($log, arguments);
          }
          // send server side
          if(SERVER_LOGGING.server_logging){
            $.ajax({
              type: "POST",
              url: SERVER_LOGGING.application_debug_url,
              contentType: "application/json",
              data: angular.toJson({
                url: $window.location.href,
                message: message,
                type: "debug"
              })
            });
          }
        },
        log: function(message){
          // preserve default behaviour
          if(SERVER_LOGGING.client_logging){
            $log.log.apply($log, arguments);
          }
          // send server side
          if(SERVER_LOGGING.server_logging){
            $.ajax({
              type: "POST",
              url: SERVER_LOGGING.application_log_url,
              contentType: "application/json",
              data: angular.toJson({
                url: $window.location.href,
                message: message,
                type: "log"
              })
            });
          }
        },
        info: function(message){
          // preserve default behaviour
          if(SERVER_LOGGING.client_logging){
            $log.info.apply($log, arguments);
          }
          // send server side
          if(SERVER_LOGGING.server_logging){
            $.ajax({
              type: "POST",
              url: SERVER_LOGGING.application_info_url,
              contentType: "application/json",
              data: angular.toJson({
                url: $window.location.href,
                message: message,
                type: "info"
              })
            });
          }
        },
        warn: function(message){
          // preserve default behaviour
          if(SERVER_LOGGING.client_logging){
            $log.warn.apply($log, arguments);
          }
          // send server side
          if(SERVER_LOGGING.server_logging){
            $.ajax({
              type: "POST",
              url: SERVER_LOGGING.application_warn_url,
              contentType: "application/json",
              data: angular.toJson({
                url: $window.location.href,
                message: message,
                type: "warn"
              })
            });
          }
        },
      });
    }
  );
})();
