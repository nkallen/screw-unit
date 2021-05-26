module ScrewUnit
  def self.configure(&block)
    Configuration.instance.instance_eval(&block)
  end

  class Configuration
    DEFAULT_SELENIUM_HOST = "localhost"
    DEFAULT_SELENIUM_PORT = 4444
    DEFAULT_SELENIUM_BROWSER_STRING = "*firefox"
    DEFAULT_SELENIUM_SCREW_SERVER_URL = "http://localhost"
    DEFAULT_SELENIUM_SPECS_PATH = "/specs"

    class << self
      def instance
        @instance ||= new
      end

      def method_missing(method, *args, &block)
        instance.send(method, *args, &block)
      end
    end

    attr_reader :path_containing_screwrc, :asset_manager, :resource_locators

    def initialize
      @asset_manager = AssetManager.new
      @resource_locators = []
      asset_manager.add_js_location("/screw_unit_core", "#{SCREW_UNIT_ROOT}/client/lib")
      asset_manager.add_js_location("/screw_unit_vendor", "#{SCREW_UNIT_ROOT}/client/vendor")
      asset_manager.add_js_location("/screw_unit_stylesheets", "#{SCREW_UNIT_ROOT}/client/stylesheets")
    end

    def load_screwrc(path_containing_screwrc)
      @path_containing_screwrc = path_containing_screwrc
      load("#{path_containing_screwrc}/.screwrc")
    end
    
    def port(port=nil)
      @port = port if port
      @port || 8080
    end

    def add_js_location(virtual_path, relative_path)
      asset_manager.add_js_location(virtual_path, absolutize_path(relative_path))
    end

    def add_location(virtual_path, relative_path)
      asset_manager.add_location(virtual_path, absolutize_path(relative_path))
    end

    def add_resource_locator(locator)
      resource_locators.unshift(locator)
    end

    def absolutize_path(relative_path)
      File.expand_path(File.join(path_containing_screwrc, relative_path))
    end

    def selenium_mode
      @selenium_mode = true
    end

    def selenium_mode?
      !@selenium_mode.nil?
    end

    def selenium_host
      ENV['SELENIUM_HOST'] || DEFAULT_SELENIUM_HOST
    end

    def selenium_port
      ENV['SELENIUM_PORT'] || DEFAULT_SELENIUM_PORT
    end

    def selenium_browser_string
      ENV['SELENIUM_BROWSER_STRING'] || DEFAULT_SELENIUM_BROWSER_STRING
    end

    def selenium_screw_server_url
      ENV['SELENIUM_SCREW_SERVER_URL'] || DEFAULT_SELENIUM_SCREW_SERVER_URL
    end

    def selenium_screw_server_port
      ENV['SELENIUM_SCREW_SERVER_PORT'] || port
    end

    def selenium_specs_path
      ENV['SELENIUM_SPECS_PATH'] || DEFAULT_SELENIUM_SPECS_PATH
    end
  end
end
