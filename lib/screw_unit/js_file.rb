module ScrewUnit
  class JsFile
    RELATIVE_REQUIRE_REGEX = /^\/\/= require\s+['"]([^'"]+)['"].*/
    GLOBAL_REQUIRE_REGEX = /^\/\/= require\s+<([^>]+)>.*/

    attr_reader :physical_path, :containing_dir, :asset_manager
    
    def initialize(physical_path, asset_manager)
      raise "JsFile created with nil physical_path" if physical_path.nil? 

      @physical_path, @asset_manager = physical_path, asset_manager
      @containing_dir = File.dirname(physical_path)
    end

    def add_dependencies_to_required_virtual_paths(required_virtual_paths)
      require_declarations.each do |require_declaration|
        require_declaration.js_file.add_dependencies_to_required_virtual_paths(required_virtual_paths)
      end
      required_virtual_paths.push(virtual_path) if !required_virtual_paths.include?(virtual_path)
    end

    def require_declarations
      declarations = []
      File.open(physical_path, 'r') do |f|
        f.readlines.each do |line|
          if match = RELATIVE_REQUIRE_REGEX.match(line)
            require_path = match[0]
            declarations.push(RelativeRequireDeclaration.new(containing_dir, match[1], asset_manager))
          end
          if match = GLOBAL_REQUIRE_REGEX.match(line)
            require_path = match[0]
            declarations.push(GlobalRequireDeclaration.new(match[1], asset_manager))
          end
        end
      end
      declarations
    end

    def virtual_path
      @virtual_path ||= asset_manager.virtualize_path(physical_path)
    end

    class RelativeRequireDeclaration
      attr_reader :js_file

      def initialize(parent_dir, relative_path, asset_manager)
        @js_file = JsFile.new(File.expand_path(File.join(parent_dir, relative_path + ".js")), asset_manager)
      end
    end

    class GlobalRequireDeclaration
      attr_reader :js_file
      def initialize(global_path, asset_manager)
        physical_path = asset_manager.physicalize_path_from_js_load_path(global_path + ".js")
        raise "No file '#{global_path}.js' found on load path" unless physical_path
        @js_file = JsFile.new(physical_path, asset_manager)
      end
    end
  end
end
