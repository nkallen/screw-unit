module ScrewUnit
  class AssetLocation
    attr_reader :virtual_prefix, :physical_prefix

    def initialize(virtual_prefix, physical_prefix)

      raise "No directory exists at #{physical_prefix}" unless File.exist?(physical_prefix) && File.directory?(physical_prefix)

      @virtual_prefix, @physical_prefix = virtual_prefix, physical_prefix
    end

    def virtualize_path(physical_path)
      if matches_physical_path?(physical_path)
        path_relative_to_location = physical_path.gsub(/^#{physical_prefix}/, "")
        File.join(virtual_prefix, path_relative_to_location)
      end
    end

    def physicalize_path(virtual_path)
      if matches_virtual_path?(virtual_path)
        path_relative_to_location = virtual_path.gsub(/^#{virtual_prefix}/, "")
        File.join(physical_prefix, path_relative_to_location)
      end
    end

    def matches_physical_path?(physical_path)
      physical_path.path_starts_with?(physical_prefix)
    end

    def matches_virtual_path?(virtual_path)
      virtual_path.path_starts_with?(virtual_prefix)
    end

    def matches_virtual_glob_pattern?(virtual_glob_pattern)
      subsumes_virtual_glob_pattern?(virtual_glob_pattern) || is_subsumed_by_virtual_glob_pattern?(virtual_glob_pattern)
    end

    def is_subsumed_by_virtual_glob_pattern?(pattern)
      glob_pattern_without_wildcards = pattern.gsub(/\/\*.*/, "")
      virtual_prefix.path_starts_with?(glob_pattern_without_wildcards)
    end

    def subsumes_virtual_glob_pattern?(pattern)
      pattern.path_starts_with?(virtual_prefix)
    end

    def virtual_glob(virtual_glob_pattern)
      Dir[physicalize_glob_pattern(virtual_glob_pattern)].map {|physical_path| virtualize_path(physical_path)}
    end

    def physicalize_glob_pattern(virtual_glob_pattern)
      if subsumes_virtual_glob_pattern?(virtual_glob_pattern)
        physicalize_path(virtual_glob_pattern)
      elsif is_subsumed_by_virtual_glob_pattern?(virtual_glob_pattern)
        wildcard = virtual_glob_pattern.scan(/\/\*.*/).first
        physical_prefix + wildcard
      else
        raise "Does not match glob pattern"
      end
    end

    def relative_find(relative_path)
      physical_path = File.join(physical_prefix, relative_path)
      return physical_path if File.exist?(physical_path)
    end
  end
end
