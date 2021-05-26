require "#{File.dirname(__FILE__)}/../../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe File do
      attr_reader :dir, :file, :asset_manager

      before do
        @dir = ::File.expand_path(::File.dirname(__FILE__))
        @asset_manager = Configuration.new.asset_manager
        asset_manager.add_js_location("/", "#{dir}/file_system_fixtures")
        @file = File.new(virtual_path, asset_manager)
      end

      def virtual_path
        "/foo.js"
      end

      def physical_path
        asset_manager.physicalize_path(virtual_path)
      end

      describe "#get" do
        attr_reader :response_code, :headers, :body

        before do
          ::File.exist?(physical_path).should be_true
          @response_code, @headers, @body = file.get
        end

        it "returns 200 as the response code" do
          response_code.should == 200
        end

        it "returs the file's mtime as the 'Last-Modified' header" do
          headers['Last-Modified'].should == ::File.mtime(physical_path).httpdate
        end

        it "returns the contents of the file as the response body" do
          response_body = ""
          body.each { |chunk| response_body.concat(chunk) }
          response_body.should == ::File.read(physical_path)
        end

        context "when the file has a .js extension" do
          before do
            virtual_path.should =~ /\.js$/
          end

          it "has a Content-Type header of 'application/javascript'" do
            headers['Content-Type'].should == "application/javascript"
          end
        end

        context "when the file has a .css extension" do
          def virtual_path
            "/foo.css"
          end

          it "has a Content-Type header of 'text/css'" do
            headers['Content-Type'].should == "text/css"
          end
        end

        context "when the file has a .png extension" do
          def virtual_path
            "/foo.png"
          end

          it "has a Content-Type header of 'text/png'" do
            headers['Content-Type'].should == "image/png"
          end
        end

        context "when the file has a .jpg extension" do
          def virtual_path
            "/foo.jpg"
          end

          it "has a Content-Type header of 'image/jpeg'" do
            headers['Content-Type'].should == "image/jpeg"
          end
        end

        context "when the file has a .jpeg extension" do
          def virtual_path
            "/foo.jpeg"
          end

          it "has a Content-Type header of 'image/jpeg'" do
            headers['Content-Type'].should == "image/jpeg"
          end
        end
      end
    end
  end
end
