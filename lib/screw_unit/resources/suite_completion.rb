module ScrewUnit
  module Resources
    class SuiteCompletion
      def initialize(kill_server_on_completion)
        @kill_server_on_completion = kill_server_on_completion
      end

      def kill_server_on_completion?
        @kill_server_on_completion
      end

      def post(request)
        puts request.body.string unless request.body.string == "success"
        if kill_server_on_completion?
          $exit_status = (request.body.string == "success") ? 0 : 1
          Thread.new do
            sleep 1 # give the server thread a moment to send the response before we kill it
            $thin_server.stop!
          end
        end
        [200, {}, "OK"]
      end
    end
  end
end
