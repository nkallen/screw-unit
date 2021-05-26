require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  describe JsFile do
    attr_reader :js_file, :dir

    before do
      @dir = File.expand_path(File.dirname(__FILE__))
      asset_manager = Configuration.new.asset_manager
      asset_manager.add_js_location("/implementations", "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_3")
      @js_file = JsFile.new("#{dir}/file_system_fixtures_for_asset_manager_specs/dir_1/1.js", asset_manager)
    end

    describe "#require_declarations" do
      it "returns a relative or global RequireDeclaration for every Sprockets-style require declaration in the file" do
        require_declarations = js_file.require_declarations
        require_declarations.size.should == 3
        require_declarations[0].js_file.physical_path.should == "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_1/subdir_1/4.js"
        require_declarations[1].js_file.physical_path.should == "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_1/7.js"
        require_declarations[2].js_file.physical_path.should == "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_3/3.js"
      end
    end
  end
end
