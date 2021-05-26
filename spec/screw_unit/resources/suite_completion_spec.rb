require "#{File.dirname(__FILE__)}/../../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe SuiteCompletion do
      attr_reader :suite_completion, :mock_request

      describe "#post" do
        before do
          $exit_status = nil
          $thin_server = Object.new
          @mock_request = Object.new
        end

        context "when #kill_server_on_completion? is true" do
          before do
            @suite_completion = SuiteCompletion.new(true)
          end

          context "when the request body is 'success'" do
            before do
              stub(mock_request).body { StringIO.new("success") }
            end

            it "sends a success response and sets the $exit_status to 0" do
              status, headers, body = suite_completion.post(mock_request)
              status.should == 200
              headers.should == {}
              body.should == "OK"
              $exit_status.should == 0
            end
          end

          context "when the request body is anything else" do
            before do
              stub(suite_completion).puts
              stub(mock_request).body { StringIO.new("failure") }
            end

            it "sends a success response and sets the $exit_status to 1" do
              status, headers, body = suite_completion.post(mock_request)
              status.should == 200
              headers.should == {}
              body.should == "OK"
              $exit_status.should == 1
            end
          end
        end

        context "when #kill_server_on_completion? is not true" do
          before do
            @suite_completion = SuiteCompletion.new(false)
            stub(suite_completion).puts
            stub(mock_request).body { StringIO.new("anything") }
          end

          it "sends a success response and does not change $exit_status" do
            status, headers, body = suite_completion.post(mock_request)
            status.should == 200
            headers.should == {}
            body.should == "OK"
            $exit_status.should be_nil
          end
        end
      end
    end
  end
end
