require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit

  describe ".configure" do
    it "instance evals the given block in an instance of Configuration" do
      block = lambda {}
      mock(Configuration.instance.instance_eval(&block))
      ScrewUnit.configure(&block)
    end
  end

  describe Configuration do
    attr_reader :configuration
    before do
      @configuration = Configuration.new
    end

    describe ".instance" do
      it "always returns the same instance of Configuration" do
        instance = Configuration.instance
        instance.class.should == Configuration
        instance.should == Configuration.instance
      end
    end

    describe "#load_screwrc" do
      it "loads .screwrc from the given base_path and assigns #path_containing_screwrc" do
        mock(configuration).load("/base/path/.screwrc")
        configuration.load_screwrc("/base/path")
        configuration.path_containing_screwrc.should == "/base/path"
      end
    end

    describe "#add_js_location" do
      it "proxies to #asset_manager after absolutizing the relative physical path from the path containing the .screwrc file" do
        stub(configuration).path_containing_screwrc { '/path_containing_screwrc' }
        mock(configuration.asset_manager).add_js_location('/foo', '/path_containing_screwrc/bar')
        configuration.add_js_location('/foo', 'bar')
      end
    end

    describe "#add_location" do
      it "proxies to #asset_manager after absolutizing the relative physical path from the path containing the .screwrc file" do
        stub(configuration).path_containing_screwrc { '/path_containing_screwrc' }
        mock(configuration.asset_manager).add_location('/foo', '/path_containing_screwrc/bar')
        configuration.add_location('/foo', 'bar')
      end
    end
  end
end
