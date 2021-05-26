require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  describe AssetLocation do
    attr_reader :dir

    before do
      @dir = File.dirname(__FILE__)
    end

    describe "#subsumes_virtual_glob_pattern?" do
      it "returns true only if the glob pattern is within the #virtual_prefix" do
        location = AssetLocation.new("/foo/bar", "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_1")
        location.subsumes_virtual_glob_pattern?("/foo/bar/**/*.js").should be_true
        location.subsumes_virtual_glob_pattern?("/foo/bar/quux/**/*.js").should be_true
        location.subsumes_virtual_glob_pattern?("/quux/bar/**/*.js").should be_false
        location.subsumes_virtual_glob_pattern?("/foo/bar_x/**/*.js").should be_false
      end
    end

    describe "#is_subsumed_by_virtual_glob_pattern?" do
      it "returns true only if the glob pattern contains the #virtual_prefix" do
        location = AssetLocation.new("/foo/bar", "#{dir}/file_system_fixtures_for_asset_manager_specs/dir_1")
        location.is_subsumed_by_virtual_glob_pattern?("/foo/**/*.js").should be_true
        location.is_subsumed_by_virtual_glob_pattern?("/foo/bar/**/*.js").should be_true
        location.is_subsumed_by_virtual_glob_pattern?("/foo/ba/**/*.js").should be_false
        location.is_subsumed_by_virtual_glob_pattern?("/foo/bar/quux/**/*.js").should be_false
      end
    end
  end
end
