module ScrewUnit
  module Resources
    class Dir < File
      def locate(name)
        virtual_child_path = ::File.join(virtual_path, name)
        physical_child_path = asset_manager.physicalize_path(virtual_child_path)

        if physical_child_path && ::File.exists?(physical_child_path)
          if ::File.directory?(physical_child_path)
            Dir.new(virtual_child_path, asset_manager)
          else
            File.new(virtual_child_path, asset_manager)
          end
        else
          FileNotFound.new(virtual_child_path)
        end
      end

      def glob(glob_pattern)
        asset_manager.glob_virtual_paths(::File.join(virtual_path, glob_pattern)).map {|virtual_path| File.new(virtual_path, asset_manager)}
      end
    end
  end
end
