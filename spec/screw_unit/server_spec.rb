require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  describe Server do
    describe ".start" do
      it "creates a new instance of Server and calls #start on it" do
        options = { :foo => "bar" }
        mock_server = Object.new
        mock(mock_server).start(options)
        stub(Server).new {  mock_server }
        Server.start(options)
      end
    end
  end
end
