module ScrewUnit
  class AssetManager
    attr_reader :locations, :js_locations
    def initialize
      @locations = []
      @js_locations = []
    end

    def add_location(virtual_path, physical_path)
      raise "Virtual and physical path must start with a '/'" unless virtual_path.starts_with?('/') && physical_path.starts_with?('/')
      location = AssetLocation.new(virtual_path, physical_path)
      locations.unshift(location)
      location
    end

    def add_js_location(virtual_path, physical_path)
      location = add_location(virtual_path, physical_path)
      js_locations.unshift(location)
      location
    end

    def virtualize_path(physical_path)
      locations.each do |location|
        if virtual_path = location.virtualize_path(physical_path)
          return virtual_path
        end
      end
      nil
    end

    def physicalize_path(virtual_path)
      locations.each do |location|
        if physical_path = location.physicalize_path(virtual_path)
          return physical_path
        end
      end
      nil
    end

    def glob_virtual_paths(virtual_glob_pattern)
      matching_locations = locations.select {|l| l.matches_virtual_glob_pattern?(virtual_glob_pattern)}
      matching_locations.map {|l| l.virtual_glob(virtual_glob_pattern)}.flatten
    end

    def virtual_dependency_paths_from_load_path(relative_paths, virtual_dependency_paths = [])
      physical_paths = relative_paths.map { |relative_path| physicalize_path_from_js_load_path(relative_path) }
      virtual_dependency_paths_from_physical_paths(physical_paths, virtual_dependency_paths)
    end

    def virtual_dependency_paths_from_physical_paths(physical_paths, virtual_dependency_paths = [])
      physical_paths.each do |physical_path|
        js_file = JsFile.new(physical_path, self)
        raise "No js file found at path #{physical_path}" unless js_file
        js_file.add_dependencies_to_required_virtual_paths(virtual_dependency_paths)
      end
      virtual_dependency_paths
    end

    def physicalize_path_from_js_load_path(relative_path)
      js_locations.each do |js_location|
        if physical_path = js_location.relative_find(relative_path)
          return physical_path
        end
      end
      nil
    end
  end
end
