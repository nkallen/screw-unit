module ScrewUnit
  module Resources
    class SpecDir < Dir
      def locate(name)
        if name == 'streaming'
          return StreamingSpecRunner.new(glob("/**/*_spec.js"), asset_manager)
        end

        virtual_child_path = ::File.join(virtual_path, name)
        physical_child_path = asset_manager.physicalize_path(virtual_child_path)

        if physical_child_path && ::File.exists?(physical_child_path)
          if ::File.directory?(physical_child_path)
            SpecDir.new(virtual_child_path, asset_manager)
          else
            File.new(virtual_child_path, asset_manager)
          end
        elsif physical_child_path && ::File.exists?(physical_child_path + ".js")
          SpecRunner.new([File.new(virtual_child_path + ".js", asset_manager)], asset_manager)
        else
          FileNotFound.new(virtual_child_path)
        end
      end

      def get
        SpecRunner.new(glob("/**/*_spec.js"), asset_manager).get
      end
    end
  end
end
