module ScrewUnit
  module Resources
    class Root < Resources::Dir
      attr_accessor :configuration, :options

      def initialize(configuration)
        @configuration = configuration
        super("/", asset_manager)
      end

      def asset_manager
        configuration.asset_manager
      end

      def locate(path_fragment)
        case path_fragment
        when "specs"
          SpecDir.new("/specs", configuration.asset_manager)
        when "complete"
          SuiteCompletion.new(configuration.selenium_mode?)
        else
          super
        end
      end
    end
  end
end
