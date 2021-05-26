require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  describe Dispatcher do
    attr_reader :dispatcher, :locator_1, :locator_2
    before do
      @locator_1 = Object.new
      @locator_2 = Object.new
      @dispatcher = Dispatcher.new(configuration)
    end

    describe "#locate_resource(path)" do
      context "when there are #resource_locators" do
        def configuration
          return @configuration if @configuration
          @configuration = Configuration.new
          @configuration.add_resource_locator(locator_1)
          @configuration.add_resource_locator(locator_2)
          @configuration
        end

        context "when one of the custom locators returns a resource" do
          attr_reader :resource
          before do
            @resource = Object.new
            mock(locator_2).locate_resource("/foo").ordered { nil }
            mock(locator_1).locate_resource("/foo").ordered { resource }
          end

          it "returns that resource" do
            dispatcher.locate_resource("/foo").should == resource
          end
        end

        context "when no custom locators return a resource" do
          before do
            mock(locator_2).locate_resource("/foo").ordered { nil }
            mock(locator_1).locate_resource("/foo").ordered { nil }
          end

          it "performs the normal dispatch starting at Resources::Root" do
            mock.instance_of(Resources::Root).locate("foo")
            dispatcher.locate_resource("/foo")
          end
        end
      end

      context "when there are no #resource_locators" do
        def configuration
          @configuration ||= Configuration.new
        end

        it "performs the normal dispatch starting at Resources::Root" do
          mock.instance_of(Resources::Root).locate("foo")
          dispatcher.locate_resource("/foo")
        end
      end
    end
  end
end
