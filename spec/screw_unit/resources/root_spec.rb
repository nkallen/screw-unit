require "#{File.dirname(__FILE__)}/../../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe Root do
      attr_reader :root, :options, :configuration
      before do
        dir = ::File.dirname(__FILE__)
        @configuration = Configuration.new
        @root = Root.new(configuration)
      end

      describe "#locate" do
        context "when called with 'specs'" do
          it "returns a SpecDir resource with a #virtual_path of '/specs' and the same AssetManager" do
            specs_dir = root.locate('specs')
            specs_dir.class.should == Resources::SpecDir
            specs_dir.virtual_path.should == "/specs"
            specs_dir.asset_manager.should == configuration.asset_manager
          end
        end

        context "when called with 'complete'" do

          context "when #selenium_mode? is true on the given configuration" do
            before do
              configuration.selenium_mode
            end

            it "returns a SuiteCompletion with #kill_server_on_completion? set to true" do
              suite_completion = root.locate('complete')
              suite_completion.class.should == Resources::SuiteCompletion
              suite_completion.kill_server_on_completion?.should be_true
            end
          end

          context "when #selenium_mode? is false on the given configuration" do
            it "returns a SuiteCompletion with #kill_server_on_completion? set to false" do
              suite_completion = root.locate('complete')
              suite_completion.class.should == Resources::SuiteCompletion
              suite_completion.kill_server_on_completion?.should be_false
            end
          end
        end
      end
    end
  end
end
