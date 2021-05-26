require "#{File.dirname(__FILE__)}/../../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe Dir do
      attr_reader :dir, :asset_manager

      before do
        spec_file_dir = ::File.expand_path(::File.dirname(__FILE__))
        @asset_manager = Configuration.new.asset_manager
      end

      describe "#locate" do
        before do
          asset_manager.add_location("/x", "#{::File.expand_path(::File.dirname(__FILE__))}/file_system_fixtures")
          @dir = Dir.new("/x", asset_manager)
        end

        context "when the string names a file in the directory" do
          it "returns a File resource with the appropriate virtual path and the same AssetManager" do
            file = dir.locate("foo.js")
            file.class.should == Resources::File
            file.virtual_path.should == "/x/foo.js"
            file.asset_manager.should == asset_manager
          end
        end

        context "when the string names a subdirectory in the directory" do
          it "returns a Dir resource with the appropriate absolute path and the same AssetManeger" do
            subdir = dir.locate("specs")
            subdir.class.should == Resources::Dir
            subdir.virtual_path.should == "/x/specs"
            subdir.asset_manager.should == asset_manager
          end
        end

        context "when the string names a file that doesn't exist" do
          it "returns a FileNotFound resource with the relative path" do
            not_found = dir.locate("bogus")
            not_found.class.should == FileNotFound
            not_found.virtual_path.should == "/x/bogus"

            not_found = Dir.new("/", asset_manager).locate("bogus")
            not_found.class.should == FileNotFound
            not_found.virtual_path.should == "/bogus"
          end
        end
      end

      describe "#glob" do
        before do
          @dir = Dir.new("/foo", asset_manager)
          absolute_dir = ::File.expand_path(::File.dirname(__FILE__))
          asset_manager.add_location("/foo/bar", "#{absolute_dir}/file_system_fixtures/code_under_test")
          asset_manager.add_location("/foo/baz", "#{absolute_dir}/file_system_fixtures/specs")
        end

        it "returns File resources with the correct relative paths for all files matching the pattern" do
          globbed_file_resources = dir.glob("/**/*.js")
          globbed_file_resources.map {|fr| fr.virtual_path}.should == ["/foo/baz/foo_spec.js", "/foo/baz/subsuite/bar_spec.js", "/foo/bar/code_under_test.js"]
          globbed_file_resources.each do |fr|
            fr.asset_manager.should == asset_manager
          end
        end
      end
    end
  end
end
