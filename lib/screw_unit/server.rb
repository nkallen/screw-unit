require "selenium"

module ScrewUnit
  class Server
    attr_reader :thin_thread

    def self.start(options)
      new.start(options)
    end

    def start(configuration)
      start_thin_server_in_new_thread(configuration)
      open_suite_with_selenium(configuration) if configuration.selenium_mode?
      thin_thread.join
    end

    def start_thin_server_in_new_thread(configuration)
      @thin_thread = Thread.new do
        $thin_server = Thin::Server.new(configuration.port) do
          run Dispatcher.new(configuration)
        end
        $thin_server.start
      end
    end

    def open_suite_with_selenium(port)
      selenium_driver = Selenium::SeleniumDriver.new(
        Configuration.selenium_host,
        Configuration.selenium_port,
        Configuration.selenium_browser_string,
        "#{Configuration.selenium_screw_server_url}:#{Configuration.selenium_screw_server_port}"
      )

      at_exit do
        selenium_driver.stop
      end

      selenium_driver.start
      selenium_driver.set_timeout(300000)
      selenium_driver.open(Configuration.selenium_specs_path)
    end
  end
end
