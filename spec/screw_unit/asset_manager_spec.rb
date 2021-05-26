require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  describe AssetManager do
    attr_reader :manager, :dir

    before do
      @dir = File.expand_path(File.dirname(__FILE__))
      @manager = AssetManager.new
      manager.add_js_location("/specs/1", "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_1")
      manager.add_js_location("/specs/2", "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_2")
      manager.add_js_location("/implementations", "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_3")
      manager.add_location("/css", "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_4")
    end

    describe "#virtualize_path" do
      it "converts a physical path to a virtual path based on the declared locations" do
        manager.virtualize_path("#{dir}/file_system_fixtures_for_asset_manager_specs/dir_1/1.js").should == "/specs/1/1.js"
        manager.virtualize_path("#{dir}/file_system_fixtures_for_asset_manager_specs/dir_2/2.js").should == "/specs/2/2.js"
        manager.virtualize_path("#{dir}/file_system_fixtures_for_asset_manager_specs/dir_3/3.js").should == "/implementations/3.js"
        manager.virtualize_path("/crap").should be_nil
      end

      it "corrently handles handles a virtual path of '/'" do
        manager.add_location('/', "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_4")
        manager.virtualize_path("#{dir}/file_system_fixtures_for_asset_manager_specs/dir_4/1.css").should == "/1.css"
      end

      it "is not confused by multiple physical paths with the same partial prefix" do
        manager.add_location("/specs/b", "#{dir}/file_system_fixtures_for_asset_manager_specs/dir")
        manager.virtualize_path("#{dir}/file_system_fixtures_for_asset_manager_specs/dir_1/1.js").should == "/specs/1/1.js"
      end
    end

    describe "#physicalize_path" do
      it "converts a virtual path to a physical path based on the declared locations" do
        manager.physicalize_path("/specs/1/1.js").should == "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_1/1.js"
        manager.physicalize_path("/specs/2/2.js").should == "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_2/2.js"
        manager.physicalize_path("/implementations/3.js").should == "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_3/3.js"
      end

      it "corrently handles handles a virtual path of '/'" do
        manager.add_location('/', "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_4")
        manager.physicalize_path('/1.css').should == "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_4/1.css"
      end

      it "is not confused by multiple virtual paths with the same partial prefix" do
        manager.add_location("/foo_prime", "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_1")
        manager.add_location("/foo", "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_2")
        manager.physicalize_path("/foo_prime/1.js").should == "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_1/1.js"
      end
    end

    describe "#glob_virtual_paths" do
      it "maps the glob pattern to the declared locations, potentially spanning multiple physical locations, and returns the matching relative paths" do
        manager.glob_virtual_paths("/specs/**/*.js").should == ["/specs/2/2.js", "/specs/1/1.js", "/specs/1/7.js", "/specs/1/subdir_1/4.js"]
        manager.glob_virtual_paths("/specs/1/*.js").should == ["/specs/1/1.js", "/specs/1/7.js"]
        manager.glob_virtual_paths("/specs/x/*.js").should == []
        manager.glob_virtual_paths("/implementations/**/*.js").should == ["/implementations/3.js", "/implementations/subdir_3/5.js"]
        manager.glob_virtual_paths("/implementations/*.js").should == ["/implementations/3.js"]
      end
    end

    describe "#virtual_dependency_paths_from_load_path" do
      it "computes the virtual paths of the require graph extending out from the files on the load path corresponding to the given paths" do
        expected_dependency_paths = [
          "/specs/1/7.js",
          "/specs/1/subdir_1/4.js",
          "/implementations/subdir_3/5.js",
          "/implementations/3.js",
          "/specs/1/1.js"
        ]
        manager.virtual_dependency_paths_from_load_path(["1.js", "subdir_3/5.js"]).should == expected_dependency_paths
      end
    end

    describe "#virtual_dependency_paths_from_physical_paths" do
      it "computes the virtual paths of the require graph extending out from thes files at the given absolute paths" do
        expected_dependency_paths = [
          "/specs/1/7.js",
          "/specs/1/subdir_1/4.js",
          "/implementations/subdir_3/5.js",
          "/implementations/3.js",
          "/specs/1/1.js"
        ]
        physical_paths = [manager.physicalize_path("/specs/1/1.js"), manager.physicalize_path("/implementations/subdir_3/5.js")]
        manager.virtual_dependency_paths_from_physical_paths(physical_paths).should == expected_dependency_paths
      end
    end

  end
end
