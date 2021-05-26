module ScrewUnit
  module Resources
    class SpecRunner
      attr_reader :spec_file_resources, :asset_manager

      def initialize(spec_file_resources, asset_manager)
        @spec_file_resources = spec_file_resources
        @asset_manager = asset_manager
      end

      def locate(path_fragment)
        if path_fragment == "streaming"
          StreamingSpecRunner.new(spec_file_resources, asset_manager)
        end
      end

      def get
        [200, {'Content-Type' => 'text/html'}, content]
      end

      protected
      def content
        "<html>\n<head>\n" +
          screw_unit_css_file_link_tag +
          "\n\n" +
          "<!-- ScrewUnit core scripts -->\n" +
          core_file_script_tags +
          "\n\n" +
          "<!-- scripts required by the specs -->\n" +
          required_script_tags +
          "\n" +
          run_specs_on_page_load +
          "\n</head>\n<body>\n</body>\n</html>\n"
      end

      def run_specs_on_page_load
        %{<script type="text/javascript">Screw.Interface.Runner.runSpecsOnPageLoad()</script>}
      end

      def screw_unit_css_file_link_tag
        %{<link rel="stylesheet" type="text/css" href="/screw_unit_stylesheets/screw.css"/>}
      end

      def core_file_script_tags
        core_file_paths.map do |core_file_path|
          script_tag(core_file_path)
        end.join("\n")
      end

      def spec_file_script_tags
        spec_file_virtual_paths.map do |virtual_path|
          script_tag(virtual_path)
        end.join("\n")
      end

      def spec_file_virtual_paths
        spec_file_resources.map do |spec_file_resource|
          spec_file_resource.virtual_path
        end
      end

      def spec_file_physical_paths
        spec_file_resources.map do |spec_file_resource|
          spec_file_resource.physical_path
        end
      end

      def required_script_tags
        required_virtual_paths.map do |virtual_path|
          script_tag(virtual_path)
        end.join("\n")
      end

      def required_virtual_paths
        asset_manager.virtual_dependency_paths_from_physical_paths(spec_file_physical_paths)
      end

      def script_tag(path)
        %{<script type="text/javascript" src="#{path}"></script>}
      end

      def core_file_paths
        asset_manager.virtual_dependency_paths_from_load_path(["screw.js"])
      end
    end
  end
end
