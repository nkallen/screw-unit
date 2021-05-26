require "#{File.dirname(__FILE__)}/../../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe SpecDir do
      attr_reader :spec_dir, :asset_manager

      before do
        dir = ::File.expand_path(::File.dirname(__FILE__))
        @asset_manager = Configuration.new.asset_manager
        asset_manager.add_js_location("/specs", "#{dir}/file_system_fixtures/specs")
        @spec_dir = SpecDir.new("/specs", asset_manager)
      end

      describe "#locate" do
        describe "when called with the name of a directory" do
          it "returns a SpecDir for that directory" do
            spec_subdir = spec_dir.locate("subsuite")
            spec_subdir.class.should == SpecDir
            spec_subdir.virtual_path.should == "/specs/subsuite"
          end
        end

        describe "when called with the name of a .js file excluding the extension" do
          it "returns a SpecRunner with the .js file as its only spec_file_resource" do
            spec_suite = spec_dir.locate("foo_spec")
            spec_suite.class.should == SpecRunner
            spec_file_resources = spec_suite.spec_file_resources
            spec_file_resources.length.should == 1
            spec_file_resources.first.virtual_path.should == "/specs/foo_spec.js"
          end
        end

        describe "when called with the name of a .js file including the extension" do
          it "returns a normal File resource for the File" do
            spec_file = spec_dir.locate("foo_spec.js")
            spec_file.class.should == File
            spec_file.virtual_path.should == "/specs/foo_spec.js"
          end
        end
      end

      describe "#get" do
        it "returns the results of #get called on a SpecRunner instantiated with all /**/*.js files in the directory" do
          spec_files = spec_dir.glob("/**/*.js")
          spec_files.should_not be_empty
          spec_dir.get.should == SpecRunner.new(spec_files, asset_manager).get
        end
      end
    end
  end
end
