module ScrewUnit
  module Resources
    class StreamingSpecRunner < SpecRunner
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

      def required_virtual_paths
        asset_manager.virtual_dependency_paths_from_physical_paths(spec_file_physical_paths) - spec_file_virtual_paths
      end

      def run_specs_on_page_load
        %{<script type="text/javascript">Screw.Interface.StreamingRunner.run_specs_on_page_load({spec_paths: #{spec_file_virtual_paths.inspect}});</script>}
      end
    end
  end
end
